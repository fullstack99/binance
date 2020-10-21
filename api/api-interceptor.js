/* eslint-disable camelcase */
import { store } from 'store'
import {
  isInvalidToken,
  isLogout,
  isEmailNotConfirmed,
} from 'utils/api-error-code'
import { userActions } from 'store/user'
import { errorActions } from 'store/error/reducers'
import { api } from './api-creator'

const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR_CODE'
const UNKNOWN_ERROR_STATUS = 504
const NETWORK_ERROR = 'Network Error'
let refreshingToken = false
let pendingRequests = []

function ApiError(error) {
  const { response, config: requestConfig, stack } = error
  this.name = 'ApiError'
  this.requestConfig = requestConfig
  this.stack = stack
  if (response) {
    this.status = response.status ?? UNKNOWN_ERROR_STATUS
    if (response.data) {
      const code =
        response.data.code?.toLowerCase() ??
        response.data.status?.toLowerCase() ??
        response.status ??
        UNKNOWN_ERROR_CODE
      this.code = code
      this.message = response.data.message ?? NETWORK_ERROR
      this.fields = response.data.fields
    } else {
      this.code = response.status
    }
  } else {
    this.status = UNKNOWN_ERROR_STATUS
    this.code = UNKNOWN_ERROR_CODE
    this.message = NETWORK_ERROR
  }
}
ApiError.prototype = Object.create(Error.prototype)
ApiError.prototype.constructor = ApiError

function rejectPendingRequsts() {
  pendingRequests.forEach(({ requestConfig, reject }) =>
    reject(new ApiError({ code: 401, requestConfig })),
  )
}

function resolvePendingRequests(newAccessToken) {
  pendingRequests.forEach(({ requestConfig, resolve }) =>
    resolve(
      api.request({
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: `TDAX ${newAccessToken}`,
        },
      }),
    ),
  )
}

function logoutUser() {
  rejectPendingRequsts()
  store.dispatch(userActions.logout.start())
  return Promise.resolve({})
}

function refreshToken(requestConfig, state) {
  refreshingToken = true
  const { Authorization, ...headers } = requestConfig.headers
  return api
    .request({
      ...requestConfig,
      headers: {
        ...headers,
        'x-refresh-token': state.user.refresh_token,
      },
    })
    .then(res => {
      const newAccessToken = res.headers['x-new-access-token']
      if (newAccessToken) {
        store.dispatch(
          userActions.update.token({ access_token: newAccessToken }),
        )
        resolvePendingRequests(newAccessToken)
        return res
      }
      return logoutUser()
    })
    .catch(error => rejectPendingRequsts(error))
    .finally(() => {
      refreshingToken = false
      pendingRequests = []
    })
}

api.interceptors.request.use(config => {
  const state = store.getState()
  if (config.url.indexOf('http') < 0 && state.user && state.user.access_token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `TDAX ${state.user.access_token}`,
      },
    }
  }
  return config
})

api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    const errorObj = new ApiError(error)
    const state = store.getState()
    if (isInvalidToken(errorObj) && state.user?.refresh_token) {
      if (refreshingToken) {
        const hasXRefreshToken = !!errorObj.requestConfig.headers[
          'x-refresh-token'
        ]
        if (hasXRefreshToken) {
          // refresh token is expired too
          return logoutUser()
        }
        // cocurrent request is failed due to access token is expired.
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            requestConfig: errorObj.requestConfig,
            resolve,
            reject,
          })
        })
      }
      return refreshToken(errorObj.requestConfig, state)
    }
    if (isLogout(errorObj)) {
      // don't think 405 is an error. it's for logout request.
      return Promise.resolve({})
    }
    if (!isEmailNotConfirmed(errorObj)) {
      // don't think EMAIL_NOT_CONFIRMED is an error. it's for email confiramtion.
      store.dispatch(errorActions.set.apiError(errorObj))
    }
    return Promise.reject(errorObj)
  },
)

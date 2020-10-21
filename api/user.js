import { get, post, remove } from './api-creator'
import { mockGet } from './mock-api/creator'

function login(data) {
  return post('sessions/', {
    ...data,
    provider: 'email',
    auth_provider_token: '',
    challenge_type: 'captcha',
  })
}

function logout() {
  return remove('/users/sign_out')
}

function emailConfirmation(data) {
  return post('/users/auth/resend_email_confirmation', data)
}

function twoFactorAuth({ sessionId, passcode }) {
  return post(`/sessions/${sessionId}/enable`, { '2fa_passcode': passcode })
}

function fetchUser(id) {
  return get(`/users/${id}`)
}

async function twoFactorValidate({ passcode }) {
  return mockGet('/2fa_validate', { passcode })
}

const userApi = {
  login,
  logout,
  emailConfirmation,
  twoFactorAuth,
  fetchUser,
  twoFactorValidate,
}

export default userApi

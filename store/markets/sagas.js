import { call, put, takeEvery } from 'redux-saga/effects'
import { marketsApi } from 'api'
import { marketsActions } from './reducers'

function* fetchProducts() {
  try {
    const marketsResponse = yield call(marketsApi.fetchProducts)

    yield put(marketsActions.success(marketsResponse.data))
  } catch (error) {
    yield put(marketsActions.failure(error))
  }
}

function* watchFetchMarkets() {
  yield takeEvery(marketsActions.fetch.toString(), fetchProducts)
}

const marketsSagas = {
  watchFetchMarkets,
}

export default marketsSagas

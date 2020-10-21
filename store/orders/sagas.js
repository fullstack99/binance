import { call, put, takeEvery } from 'redux-saga/effects'
import { ordersApi, orderBookApi } from 'api'
import { ordersActions, createOrdersActions } from './reducers'
import { ordersExchangeActions } from '../exchange/reducers'

function* fetchOrders(action) {
  try {
    const orders = yield call(ordersApi.fetchOrders, action.payload)
    yield put(ordersActions.fetch.success(orders))
  } catch (error) {
    yield put(ordersActions.fetch.failure(error))
  }
}

function* watchFetchOrders() {
  yield takeEvery(ordersActions.fetch.start.toString(), fetchOrders)
}

function* cancelOrder(action) {
  try {
    yield call(ordersApi.cancelOrder, action.payload)
    yield put(ordersActions.cancel.success(action.payload.id))
    const openOrderdata = {
      pair: action.payload.pair,
      status: 'open',
      side: 'all',
    }
    const openOrders = yield call(ordersApi.fetchOrders, openOrderdata)
    yield put(ordersActions.fetch.success(openOrders))

    const orderHistorydata = {
      pair: action.payload.pair,
    }
    const ordersExchange = yield call(
      orderBookApi.getHistoryOrders,
      orderHistorydata,
    )
    yield put(ordersExchangeActions.fetch.success(ordersExchange))
  } catch (error) {
    yield put(ordersActions.cancel.failure(error))
  }
}

function* watchCancelOrder() {
  yield takeEvery(ordersActions.cancel.start.toString(), cancelOrder)
}

function* createOrder(action) {
  try {
    yield call(ordersApi.createOrder, action.payload)
    yield put(createOrdersActions.create.success())
    const openOrderdata = {
      pair: action.payload.pair,
      status: 'open',
      side: 'all',
    }
    const openOrders = yield call(ordersApi.fetchOrders, openOrderdata)
    yield put(ordersActions.fetch.success(openOrders))

    const orderHistorydata = {
      pair: action.payload.pair,
    }
    const ordersExchange = yield call(
      orderBookApi.getHistoryOrders,
      orderHistorydata,
    )
    yield put(ordersExchangeActions.fetch.success(ordersExchange))
  } catch (error) {
    yield put(createOrdersActions.create.failure(error))
  }
}

function* watchCreateOrder() {
  yield takeEvery(createOrdersActions.create.start.toString(), createOrder)
}

const ordersSagas = {
  watchFetchOrders,
  watchCancelOrder,
  watchCreateOrder,
}

export default ordersSagas

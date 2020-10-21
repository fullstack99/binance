import { get, remove, post } from './api-creator'

function fetchOrders(data) {
  return get('/v3/orders/user', { ...data, offset: 0, limit: 20 })
}

function cancelOrder({ id, ...rest }) {
  return remove(`/orders/${id}`, rest)
}

function createOrder(data) {
  return post('/orders/', data)
}

const ordersApi = { fetchOrders, cancelOrder, createOrder }

export default ordersApi

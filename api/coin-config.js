import { get } from './api-creator'
import { mockGet } from './mock-api/creator'

function fetchCoinConfig() {
  return get('/configs/')
}

function fetchCoinRate(data) {
  return mockGet(`/coin/${data}`)
}

const coinConfigApi = { fetchCoinConfig, fetchCoinRate }

export default coinConfigApi

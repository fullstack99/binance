import { get } from './api-creator'

function fetchCoinDepositAddress(data) {
  return get(`/deposit-addresses/${data}`)
}

const depositAddressApi = { fetchCoinDepositAddress }

export default depositAddressApi

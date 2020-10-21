import { get } from './api-creator'

function fetchDepositCryptoHistory(data) {
  return get('/crypto-deposits/', data)
}

function fetchDepositFiatHistory(data) {
  return get('/bank-account-deposits/', data)
}

const depositHistoryApi = {
  fetchDepositCryptoHistory,
  fetchDepositFiatHistory,
}

export default depositHistoryApi

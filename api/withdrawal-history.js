import { get } from './api-creator'

function fetchWithdrawalCryptoHistory(data) {
  return get('/crypto-withdrawals/', data)
}

function fetchWithdrawalFiatHistory(data) {
  return get('/bank-account-withdrawals/', data)
}

const withdrawalHistoryApi = {
  fetchWithdrawalCryptoHistory,
  fetchWithdrawalFiatHistory,
}

export default withdrawalHistoryApi

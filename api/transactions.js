import { get } from './api-creator'

function fetchTransactions(data) {
  return get('/transactions/', data)
}

const transactionsApi = { fetchTransactions }

export default transactionsApi

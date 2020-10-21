import { mockGet } from './mock-api/creator'

function fetchCurrency() {
  return mockGet('/currency/')
}

const currencyApi = { fetchCurrency }

export default currencyApi

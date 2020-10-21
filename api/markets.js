import { apiWithProxy } from 'utils/binance-proxy'
import { get } from './api-creator'

function fetchProducts() {
  return get(
    apiWithProxy(
      'https://www.binance.com/exchange-api/v1/public/asset-service/product/get-products',
    ),
  )
}

const marketsApi = { fetchProducts }

export default marketsApi

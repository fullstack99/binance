import { apiWithProxy } from 'utils/binance-proxy'
import { get } from './api-creator'

const getDepthInfo = (baseAsset, quoteAsset, limit = 500) =>
  get('/v3/depth', {
    limit,
    symbol: `${baseAsset}_${quoteAsset}`,
  })

const getAggTradeInfo = (baseAsset, quoteAsset, limit = 80) =>
  get('/v3/aggTrades', {
    limit,
    symbol: `${baseAsset}_${quoteAsset}`,
  })

const getExchangeInfo = () => get('/v3/exchangeInfo')

const getBookTickerPrice = () =>
  get(apiWithProxy(`https://www.binance.com/api/v1/ticker/bookTicker`))

const getHistoryOrders = data =>
  get('/v3/orders/user', {
    ...data,
    offset: 0,
    limit: 20,
  })

const orderBookApi = {
  getDepthInfo,
  getAggTradeInfo,
  getExchangeInfo,
  getHistoryOrders,
  getBookTickerPrice,
}

export default orderBookApi

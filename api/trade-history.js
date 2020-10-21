import { get } from './api-creator'

const tradeHistoryApi = (baseAsset, quoteAsset, limit = 100) =>
  get('/v3/aggTrades', {
    symbol: `${baseAsset}_${quoteAsset}`,
    limit,
  })

export default tradeHistoryApi

import OrderBook from 'components/orderbook'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { parseData, parseTypes } from '../helpers'

const OrderBookContainer = ({
  asks,
  bids,
  lastTrade,
  decimals,
  theme,
  volDLen,
  loading,
  baseAssetPrecision,
  quoteAssetPrecision,
}) => {
  const [askOrders, setAskOrders] = useState([])
  const [bidOrders, setBidOrders] = useState([])

  useEffect(() => {
    const { bidDataset, askDataset } = parseData(
      bids,
      asks,
      parseTypes.orderbook,
    )

    setAskOrders(askDataset)
    setBidOrders(bidDataset.reverse())
  }, [asks, bids])

  return (
    <OrderBook
      askData={askOrders}
      bidData={bidOrders}
      trade={lastTrade}
      decimals={decimals}
      theme={theme}
      volDLen={volDLen}
      loading={loading}
      baseAssetPrecision={baseAssetPrecision}
      quoteAssetPrecision={quoteAssetPrecision}
    />
  )
}

OrderBookContainer.propTypes = {
  asks: PropTypes.array.isRequired,
  bids: PropTypes.array.isRequired,
  lastTrade: PropTypes.object.isRequired,
  decimals: PropTypes.object.isRequired,
  volDLen: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  baseAssetPrecision: PropTypes.number.isRequired,
  quoteAssetPrecision: PropTypes.number.isRequired,
}

export default OrderBookContainer

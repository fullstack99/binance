/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import { LinkWithLanguageInPath } from 'routes/with-language'
import cx from 'classnames'
import { debounce, toUpper } from 'lodash'
import { useIntl } from 'react-intl'
import {
  exchangeSelectors,
  orderBookActions,
  marketActions,
  historyActions,
  chartActions,
} from 'store/exchange'
import { configSelectors } from 'store/config'
import get from 'lodash/get'
import { useDebounce } from 'hooks/helpers'
import useError from 'hooks/error'
import Websocket from 'utils/websocket'
import pageNamePathMap from 'routes/page-name-path-map'
import { MetaContext, defaultTitle } from 'routes/layout/meta'
import { getFormatOption } from 'utils/math'
import { coinsActions, coinsSelectors } from 'store/coins'
import { BASE_WEB_SOCKET } from 'constants/env'
import OrderBook from './orderbook'
import ExchangeGraph from './exchange-graph'
import MarketSelector from './market-selector'
import ExchangeMarket from './exchange-market'
import TradeHistory from './trade-history'
import ExchangeHeader from './exchange-header'
import { filterByBorder } from './helpers'
import NewsHeader from './news-header'

import styles from './index.module.scss'
import OpenOrders from './open-order'
import OrderHistory from './order-history'

const MAX_API_RETRY_COUNT = 50
const API_RETRY_INTERVAL = 3000
const DEFAULT_DECIMAL = 2

export default function ExchangePage() {
  const dispatch = useDispatch()
  const bhistory = useHistory()
  const intl = useIntl()
  const { setTitle } = useContext(MetaContext)
  const { pair } = useParams()
  const {
    baseAsset,
    quoteAsset,
    askOrder,
    bidOrder,
    loading: orderbookLoading,
  } = useSelector(exchangeSelectors.orderbook)
  const { tickers } = useSelector(exchangeSelectors.market)
  const { history, loading: historyLoading } = useSelector(
    exchangeSelectors.history,
  )
  const { theme } = useSelector(exchangeSelectors.chart)
  const debouncedTheme = useDebounce(theme, 300)
  const language = useSelector(configSelectors.language)
  const locale = language === 'en' ? 'en-us' : 'th'
  const socketRef = useRef(null)
  const lastTrade = useRef({})
  // const lastUpdateId = useRef(0);
  const volDLen = useRef(0)
  const [headerData, setHeaderData] = useState({ base: '', quote: '' })
  const [decimals, setDecimals] = useState({ start: 0, end: DEFAULT_DECIMAL })
  const [bids, setBids] = useState([])
  const [asks, setAsks] = useState([])
  const [baseAssetPrecision, setBaseAssetPrecision] = useState(0)
  const [quoteAssetPrecision, setQuoteAssetPrecision] = useState(0)

  const [openOrderRefresh, setOpenOrderRefresh] = useState(false)
  const [orderHistoryRefresh, setOrderHistoryRefresh] = useState(false)

  const symbol = `${baseAsset}_thb`

  const [{ apiError }] = useError()
  const apiErrorDebounced = useDebounce(apiError, API_RETRY_INTERVAL)
  const ticker = tickers.find(
    v => v.symbol === `${baseAsset.toUpperCase()}${quoteAsset.toUpperCase()}`,
  )
  const apiRetryCount = useRef(0)
  const defaultFormatOption = getFormatOption(decimals.end)

  const trading = useSelector(coinsSelectors.trading)

  const fetchCoinConfig = useCallback(() => {
    dispatch(coinsActions.fetch.start())
  }, [dispatch])

  useEffect(() => {
    fetchCoinConfig()
  }, [fetchCoinConfig])

  useEffect(() => {
    if (trading) {
      // eslint-disable-next-line array-callback-return
      Object.keys(trading).map(key => {
        if (get(trading[key], 'symbol', null) === symbol) {
          setBaseAssetPrecision(get(trading[key], 'baseAssetPrecision', 0))
          setQuoteAssetPrecision(
            get(trading[key], 'quoteAssetPrecision', 0) - 2 < 0
              ? 0
              : get(trading[key], 'quoteAssetPrecision', 0),
          )
        }
      })
    }
  }, [trading, symbol])

  useEffect(() => {
    if (!!headerData.value && headerData.base && headerData.quote) {
      const baseQuote = toUpper(`${headerData.base}${headerData.quote}`)
      setTitle(
        `${intl.formatNumber(
          headerData.value,
          defaultFormatOption,
        )} | ${baseQuote} | ${defaultTitle}`,
      )
    }
  }, [headerData])

  useEffect(() => {
    if (!apiErrorDebounced && apiRetryCount.current === 0) {
      return
    }

    apiRetryCount.current += 1

    if (apiRetryCount.current === 1) {
      dispatch(orderBookActions.reset())
      dispatch(marketActions.reset())
      dispatch(historyActions.reset())
    }
    if (apiRetryCount.current === MAX_API_RETRY_COUNT && socketRef.current) {
      socketRef.current.destroy()
      socketRef.current = null
      return
    }
    if (apiRetryCount.current > MAX_API_RETRY_COUNT) {
      return
    }

    debounce(() => {
      dispatch(marketActions.getSymbols.start())
    }, API_RETRY_INTERVAL)()
  }, [dispatch, apiErrorDebounced])

  useEffect(() => {
    const [base, quote] = pair.toLowerCase().split('_')

    if (!tickers.length || (base === baseAsset && quote === quoteAsset)) {
      return
    }

    const matched = tickers.findIndex(
      v => v?.symbol?.toLowerCase() === `${base}_${quote}`,
    )

    if (matched === -1) {
      bhistory.push(
        pageNamePathMap.exchange.replace(':pair', `${base}_${quote}`),
      )
    } else {
      dispatch(historyActions.reset())
      dispatch(orderBookActions.reset())
      dispatch(
        orderBookActions.setAsset({
          baseAsset: base,
          quoteAsset: quote,
        }),
      )
    }
  }, [bhistory, dispatch, pair, tickers, baseAsset, quoteAsset])

  useEffect(() => {
    socketRef.current = new Websocket()
    dispatch(marketActions.getSymbols.start())

    return () => {
      if (socketRef.current) {
        socketRef.current.destroy()
        socketRef.current = null
      }
    }
  }, [dispatch])

  useEffect(() => {
    setHeaderData(v => ({
      ...v,
      base: baseAsset,
      quote: quoteAsset,
    }))

    if (!socketRef.current) {
      return
    }

    // setting up socket
    const basst = baseAsset.toLowerCase()
    const qasst = quoteAsset.toLowerCase()

    if (
      pair.toLowerCase() !== `${basst}_${qasst}` ||
      apiRetryCount.current > 0
    ) {
      return
    }

    dispatch(orderBookActions.initialFetch.start())

    const depthChannel = `${basst}_${qasst}@depth`
    const tradeChannel = `${basst}_${qasst}@aggTrade`
    const tickerChannel = `!miniTicker@arr@3000ms`
    const url = `${BASE_WEB_SOCKET}stream?streams=${tickerChannel}/${depthChannel}/${tradeChannel}`

    const onMessage = rawData => {
      const data = JSON.parse(rawData)
      if (!data) {
        return
      }

      let action = null
      const payload = data

      switch (data) {
        case tradeChannel:
          action = historyActions.setLastHistory
          break

        case depthChannel:
          action = orderBookActions.setOrders

          // correct data by api, every 50 events
          // if (payload.u - lastUpdateId.current > 1000) {
          //   dispatch(orderBookActions.initialFetch.start(true));
          //   lastUpdateId.current = payload.u;
          // }
          break

        case tickerChannel:
          action = marketActions.setTickers
          break

        default:
          break
      }

      if (action) {
        dispatch(action(payload))
      }
    }

    socketRef.current.configure({
      url,
      onMessage,
      retryTime: API_RETRY_INTERVAL,
    })
  }, [dispatch, pair, baseAsset, quoteAsset, apiRetryCount.current])

  useEffect(() => {
    if (!ticker) {
      return
    }
    setHeaderData(v => ({
      ...v,
      ...ticker,
    }))
  }, [ticker])

  useEffect(() => {
    if (!tickers.length) {
      return
    }

    // api retry logic - resume
    if (apiRetryCount.current > 0) {
      apiRetryCount.current = 0
      socketRef.current.destroy()
      socketRef.current = null
    }
    if (!socketRef.current && apiRetryCount.current === 0) {
      socketRef.current = new Websocket()
    }
  }, [tickers])

  useEffect(() => {
    if (!history.length) {
      return
    }

    const valueAnalysis = {
      isValueUp: false,
      isValueDown: false,
    }
    if (lastTrade.current.value) {
      valueAnalysis.isValueUp =
        history[history.length - 1].value > lastTrade.current.value
      valueAnalysis.isValueDown =
        history[history.length - 1].value < lastTrade.current.value
    } else if (history.length > 1) {
      valueAnalysis.isValueUp =
        history[history.length - 1].value > history[history.length - 2].value
      valueAnalysis.isValueDown =
        history[history.length - 1].value < history[history.length - 2].value
    }
    lastTrade.current = {
      ...history[history.length - 1],
      ...valueAnalysis,
    }

    setHeaderData(v => ({
      ...v,
      ...lastTrade.current,
    }))
  }, [history])

  useEffect(() => {
    const { data: bidOrders } = filterByBorder(
      bidOrder,
      lastTrade.current.value,
      true,
    )
    const { data: askOrders } = filterByBorder(
      askOrder,
      lastTrade.current.value,
      false,
    )

    if (askOrders.length === 0 || bidOrders.length === 0) {
      lastTrade.current = {}
    } else {
      const start = 0
      const end = quoteAssetPrecision

      if (start !== decimals.start || end !== decimals.end) {
        setDecimals({ start, end })
      }
    }

    setAsks(askOrders)
    setBids(bidOrders)
  }, [askOrder, bidOrder, decimals])

  useEffect(() => {
    const { volume } = lastTrade.current
    const d = (`${volume}`.split('.')[1] || '').length
    if (volDLen.current === 0 || volDLen.current < d) {
      volDLen.current = d
    }
    if (volume === undefined) {
      volDLen.current = 0
    }
  }, [lastTrade.current.volume])

  const onThemeChange = useCallback(
    _theme => dispatch(chartActions.setTheme(_theme)),
    [dispatch],
  )

  return (
    <>
      <NewsHeader locale={locale} />
      <div className={cx(styles.root, debouncedTheme)}>
        <div className={styles.mainContainer}>
          <div className={styles.leftContainer}>
            <div className={styles.headerContainer}>
              <ExchangeHeader
                data={headerData}
                decimals={decimals}
                language={language}
                theme={debouncedTheme}
                volDLen={volDLen.current}
                loading={orderbookLoading}
                onThemeChange={onThemeChange}
              />
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.orderbookContainer}>
                <OrderBook
                  bids={bids}
                  asks={asks}
                  lastTrade={lastTrade.current}
                  decimals={decimals}
                  theme={debouncedTheme}
                  volDLen={volDLen.current}
                  loading={orderbookLoading}
                  baseAssetPrecision={baseAssetPrecision}
                  quoteAssetPrecision={quoteAssetPrecision}
                />
              </div>
              <div className={styles.exchangeContainer}>
                <div className={styles.graphContainer}>
                  <ExchangeGraph
                    bids={bids}
                    asks={asks}
                    theme={debouncedTheme}
                    lang={locale}
                    lastTrade={lastTrade.current}
                  />
                </div>
                <div className={styles.exchangeMarketContainer}>
                  <ExchangeMarket
                    theme={debouncedTheme}
                    baseAssetPrecision={baseAssetPrecision}
                    quoteAssetPrecision={quoteAssetPrecision}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rightContainer}>
            <div className="bordered">
              <MarketSelector
                theme={theme}
                tickers={tickers}
                baseAssetPrecision={baseAssetPrecision}
              />
            </div>
            <div>
              <TradeHistory
                history={history}
                volDLen={baseAssetPrecision}
                decimal={quoteAssetPrecision}
                loading={historyLoading}
                theme={debouncedTheme}
              />
            </div>
          </div>
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.openOrder}>
            <div className={styles.openOrderHeader}>
              <h2 className={cx(styles.openOrderTitle, styles[debouncedTheme])}>
                {intl.formatMessage({
                  id: 'exchange.latest_open_orders_title',
                  defaultMessage: 'My latest open orders',
                })}
                {` (${baseAsset?.toUpperCase()}/${quoteAsset?.toUpperCase()})`}
              </h2>
              <div>
                <span
                  role="link"
                  tabIndex={0}
                  className={cx(
                    styles.openOrderRefresh,
                    styles[debouncedTheme],
                  )}
                  onClick={() => setOpenOrderRefresh(true)}
                >
                  {intl.formatMessage({
                    id: 'exchange.open_order.refresh',
                    defaultMessage: 'Refresh',
                  })}
                </span>
                <LinkWithLanguageInPath
                  target="_blank"
                  to={`${pageNamePathMap.ordersOpenOrders}?pair=${baseAsset}/thb&side=all`}
                >
                  <span
                    className={cx(
                      styles.openOrderShowMore,
                      styles[debouncedTheme],
                    )}
                  >
                    {intl.formatMessage({
                      id: 'exchange.open_order.show_more',
                      defaultMessage: 'Show more',
                    })}
                  </span>
                </LinkWithLanguageInPath>
              </div>
            </div>
            <OpenOrders
              refresh={openOrderRefresh}
              setRefresh={setOpenOrderRefresh}
              theme={debouncedTheme}
            />
          </div>
          <div className={styles.orderHistory}>
            <div className={styles.orderHistoryHeader}>
              <h2
                className={cx(styles.orderHistoryTitle, styles[debouncedTheme])}
              >
                {intl.formatMessage({
                  id: 'exchange.latest_orders_history_title',
                  defaultMessage: 'My latest order history',
                })}
                {` (${baseAsset?.toUpperCase()}/${quoteAsset?.toUpperCase()})`}
              </h2>
              <div>
                <span
                  role="link"
                  tabIndex={0}
                  className={cx(
                    styles.orderHistoryRefresh,
                    styles[debouncedTheme],
                  )}
                  onClick={() => setOrderHistoryRefresh(true)}
                >
                  {intl.formatMessage({
                    id: 'exchange.order_history.refresh',
                    defaultMessage: 'Refresh',
                  })}
                </span>
                <LinkWithLanguageInPath
                  target="_blank"
                  to={`${pageNamePathMap.ordersOrderHistory}?pair=${baseAsset}/thb&side=all`}
                >
                  <span
                    className={cx(
                      styles.orderHistoryShowMore,
                      styles[debouncedTheme],
                    )}
                  >
                    {intl.formatMessage({
                      id: 'exchange.order_history.show_more',
                      defaultMessage: 'Show more',
                    })}
                  </span>
                </LinkWithLanguageInPath>
              </div>
            </div>
            <OrderHistory
              refresh={orderHistoryRefresh}
              setRefresh={setOrderHistoryRefresh}
              theme={debouncedTheme}
            />
          </div>
        </div>
      </div>
    </>
  )
}

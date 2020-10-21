import React, { useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { exchangeSelectors, chartActions } from 'store/exchange'
import cx from 'classnames'

import ChartModeSelector from 'components/chart-mode-selector'
import IntervalSelector from 'components/interval-selector'
import { Loading } from 'asset/icons'
import * as FullScreen from 'utils/fullscreen'
import TVChart from './tv-chart'
import DepthChart from './depth-chart'

import styles from './index.module.scss'

const ExchangeGraph = ({ bids, asks, theme, lang, lastTrade }) => {
  const { baseAsset, quoteAsset } = useSelector(exchangeSelectors.orderbook)
  const { interval, mode, fullScreen } = useSelector(exchangeSelectors.chart)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const symbol = `${baseAsset}${quoteAsset}`

  const setInterval = useCallback(
    value => dispatch(chartActions.setInterval(value)),
    [dispatch],
  )

  const setMode = useCallback(value => dispatch(chartActions.setMode(value)), [
    dispatch,
  ])

  const setFullScreen = useCallback(() => {
    dispatch(chartActions.setFullScreen(!fullScreen))

    const el = document.querySelector('#graphPane')

    // Full screen mode
    if (!fullScreen) {
      FullScreen.request(el)
    } else if (fullScreen) {
      FullScreen.exit()
    }
  }, [dispatch, fullScreen])

  return (
    <div id="graphPane" className={cx(styles.root, 'bordered')}>
      <div className={cx(styles.selectorWrapper, 'lightbg')}>
        <div>
          {mode === 'TRADING_VIEW' && (
            <IntervalSelector
              interval={interval}
              onIntervalChange={setInterval}
            />
          )}
        </div>
        <ChartModeSelector
          mode={mode}
          fullScreen={fullScreen}
          onModeChange={setMode}
          onFullScreenChange={setFullScreen}
        />
      </div>
      <div className={styles.graphWrapper}>
        <div className={cx({ [styles.active]: mode === 'TRADING_VIEW' })}>
          <TVChart
            symbol={symbol}
            interval={interval}
            setLoading={setLoading}
            theme={theme}
          />
        </div>
        <div className={cx({ [styles.active]: mode === 'DEPTH' })}>
          <DepthChart
            bids={bids}
            asks={asks}
            theme={theme}
            base={baseAsset}
            quote={quoteAsset}
            lang={lang}
            mode={mode}
            lastTrade={lastTrade}
          />
        </div>
        {loading && (
          <div className={cx(styles.loading, styles[theme])}>
            <Loading width={40} height={40} fill="#3983fa" />
          </div>
        )}
      </div>
    </div>
  )
}

ExchangeGraph.propTypes = {
  bids: PropTypes.array.isRequired,
  asks: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  lastTrade: PropTypes.any.isRequired,
}

export default ExchangeGraph

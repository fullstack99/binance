import cx from 'classnames'
import { isEqual } from 'lodash'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { parseData } from '../../helpers'
import {
  colors,
  createChart,
  fixScale,
  fixTooltipPosition,
  moveCenterPosX,
  updateConfig,
} from './config'
import styles from './index.module.scss'

export default function DepthChart({
  bids,
  asks,
  theme,
  base,
  quote,
  lang,
  mode,
  lastTrade,
}) {
  const chartRef = useRef(null)
  const prevAsks = useRef([])
  const prevBids = useRef([])
  const prevMode = useRef(null)
  const prevTick = useRef(null)
  const scrolled = useRef(false)
  const diffPercent = useRef(0)
  const timer = useRef(null)
  const resizeObs = useRef(null)
  const [lrSetting, setLrSetting] = useState({
    width: 693,
    height: 394,
  })
  const { width, height } = lrSetting

  useEffect(() => {
    chartRef.current = createChart()

    const graphPaneEl = document.getElementById('graphPane')
    const onResize = () => {
      setLrSetting({
        width: graphPaneEl.clientWidth,
        height: graphPaneEl.clientHeight - 26,
      })
    }
    onResize()
    resizeObs.current = new ResizeObserver(onResize)
    resizeObs.current.observe(graphPaneEl)

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
      resizeObs.current.unobserve(graphPaneEl)
      clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    const ctx = document.getElementById('depthChart').getContext('2d')
    const key = theme.toUpperCase()

    const bidGrad = ctx.createLinearGradient(0, 0, 0, 400)
    bidGrad.addColorStop(0, colors[`BID_HIGH_${key}`])
    bidGrad.addColorStop(0.5, colors[`BID_HIGH_${key}`])
    bidGrad.addColorStop(1, colors[`BID_LOW_${key}`])

    const askGrad = ctx.createLinearGradient(0, 0, 0, 400)
    askGrad.addColorStop(0, colors[`ASK_HIGH_${key}`])
    askGrad.addColorStop(0.5, colors[`ASK_HIGH_${key}`])
    askGrad.addColorStop(1, colors[`ASK_LOW_${key}`])

    chartRef.current.data.datasets[0].backgroundColor = bidGrad
    chartRef.current.data.datasets[1].backgroundColor = askGrad

    chartRef.current.update()
  }, [theme])

  useEffect(() => {
    // split here to improve performance
    if (!lastTrade || !asks.length || !bids.length) {
      return
    }
    diffPercent.current =
      ((asks[0].value - bids[0].value) / lastTrade.value) * 100
  }, [asks, bids, lastTrade])

  useEffect(() => {
    if (!chartRef.current || !bids.length || !asks.length) {
      return
    }
    const { bidDataset, askDataset } = parseData(
      bids.slice(0, 100),
      asks.slice(0, 100),
    )
    let needsUpdate =
      mode !== prevMode.current && bidDataset.length && askDataset.length
    prevMode.current = mode

    if (!isEqual(asks, prevAsks.current)) {
      chartRef.current.data.datasets[1].data = askDataset
      prevAsks.current = asks
      needsUpdate = bidDataset.length > 0
    }
    if (!isEqual(bids, prevBids.current)) {
      chartRef.current.data.datasets[0].data = bidDataset
      prevAsks.current = bids
      needsUpdate = askDataset.length > 0
    }
    if (needsUpdate) {
      const xPos = (bidDataset[bidDataset.length - 1].x + askDataset[0].x) / 2
      const maxY =
        Math.max(bidDataset[0].y, askDataset[askDataset.length - 1].y) * 1.2
      const minX = bidDataset[0].x
      const maxX = askDataset[askDataset.length - 1].x
      const tick = `${base.toUpperCase()}_${quote.toUpperCase()}`

      // persist zoom status except it is just after symbol changes
      if (prevTick.current !== tick) {
        scrolled.current = false
        prevTick.current = tick
      }

      moveCenterPosX({ chart: chartRef.current, xPos })

      fixScale({
        chart: chartRef.current,
        fixX: !scrolled.current,
        maxY,
        minX,
        maxX,
      })

      chartRef.current.update()

      // wait for chart rendered to get meta data
      timer.current = setTimeout(() => {
        fixTooltipPosition({ chart: chartRef.current })
        updateConfig({
          chart: chartRef.current,
          quote,
          theme,
          lang,
          diffPercent: diffPercent.current.toFixed(2),
          onZoom: () => {
            scrolled.current = true
          },
        })
      }, 0)
    }
  }, [asks, bids, lang, base, quote, theme, mode])

  return (
    <div className={cx(styles.depthChartContainer, 'darkbg')}>
      <canvas id="depthChart" />
      <canvas
        id="labelLayer"
        className={styles.labelLayer}
        width={width}
        height={height}
      />
    </div>
  )
}

DepthChart.propTypes = {
  bids: PropTypes.array.isRequired,
  asks: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
  base: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  lastTrade: PropTypes.any.isRequired,
}

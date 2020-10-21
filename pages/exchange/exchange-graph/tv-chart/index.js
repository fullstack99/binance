import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef } from 'react'
import { widget as Widget } from './charting_library.min'
import defaultOptions from './config'
import styles from './index.module.scss'

function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(window.location.search)
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export default function TVChart({ symbol, interval, theme, setLoading }) {
  const tvWidgetRef = useRef(null)

  const getTvWidget = useCallback(() => {
    const options = {
      symbol,
      interval,
      theme,
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
        defaultOptions.datafeedUrl,
        defaultOptions.supportedResolutions,
      ),
      container_id: defaultOptions.containerId,
      library_path: defaultOptions.libraryPath,
      locale: getLanguageFromURL() || 'en',
      disabled_features: defaultOptions.disabledFeatures,
      enabled_features: ['study_templates'],
      charts_storage_url: defaultOptions.chartsStorageUrl,
      charts_storage_api_version: defaultOptions.chartsStorageApiVersion,
      client_id: defaultOptions.clientId,
      user_id: defaultOptions.userId,
      fullscreen: defaultOptions.fullscreen,
      autosize: defaultOptions.autosize,
      overrides: {
        ...defaultOptions.overrides.default,
        ...defaultOptions.overrides[theme],
      },
      loading_screen: defaultOptions.loadingScreen[theme],
      studies_overrides: defaultOptions.studiesOverrides,
      time_frames: defaultOptions.timeframes,
      custom_css_url: `css/${theme}-theme.min.css`, // change this to when theme mode changes (default: light theme)
    }
    return new Widget(options)
  }, [symbol, interval, theme])

  useEffect(() => {
    if (tvWidgetRef.current) {
      setLoading(true)
      tvWidgetRef.current.setSymbol(symbol, interval, () => {
        setLoading(false)
      })
    }
  }, [setLoading, symbol, interval])

  useEffect(() => {
    tvWidgetRef.current = getTvWidget()

    setLoading(true)
    tvWidgetRef.current.onChartReady(() => {
      setLoading(false)
    })

    return () => {
      if (tvWidgetRef.current !== null) {
        try {
          tvWidgetRef.current.remove()
        } catch (err) {
          console.error(err)
        }
        tvWidgetRef.current = null
      }
    }
  }, [setLoading, getTvWidget])

  return (
    <div id={defaultOptions.containerId} className={styles.tvChartContainer} />
  )
}

TVChart.defaultProps = {
  symbol: defaultOptions.symbol,
  interval: defaultOptions.interval,
  setLoading: () => {},
}

TVChart.propTypes = {
  symbol: PropTypes.string,
  interval: PropTypes.string,
  setLoading: PropTypes.func,
  theme: PropTypes.string.isRequired,
}

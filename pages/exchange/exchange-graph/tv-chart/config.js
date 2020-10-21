import { BASE_URL } from 'constants/env'

export default {
  symbol: 'btc_thb',
  interval: '60',
  containerId: 'tvChartContainer',
  datafeedUrl: BASE_URL,
  libraryPath: '/charting_library/',
  chartsStorageUrl: 'https://saveload.tradingview.com',
  chartsStorageApiVersion: '1.1',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: false,
  autosize: true,
  timeframes: [], // timeframes on bottom bar left, passing emtpy array to disable it
  supportedResolutions: [
    '1',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    '360',
    '720',
    '1D',
    '1W',
    '1M',
  ],
  disabledFeatures: [
    'use_localstorage_for_settings',
    'left_toolbar',
    'header_widget',
    'border_around_the_chart',
  ],
  /* --- Detailed documentation is here: https://github.com/mmmy/css3demos/wiki/Overrides --- */
  overrides: {
    default: {
      'mainSeriesProperties.candleStyle.upColor': '#6fa801',
      'mainSeriesProperties.candleStyle.downColor': '#ea0f70',
      'mainSeriesProperties.candleStyle.drawWick': true,
      'mainSeriesProperties.candleStyle.drawBorder': true,
      'mainSeriesProperties.candleStyle.borderColor': '#6fa801',
      'mainSeriesProperties.candleStyle.borderUpColor': '#6fa801',
      'mainSeriesProperties.candleStyle.borderDownColor': '#ea0f70',
      'mainSeriesProperties.candleStyle.wickUpColor': '#6fa801',
      'mainSeriesProperties.candleStyle.wickDownColor': '#ea0f70',
      'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
      'mainSeriesProperties.extendedHours': false,
    },
    dark: {
      'paneProperties.background': '#1a1a1a',
      'scalesProperties.backgroundColor': '#1a1a1a',
      'scalesProperties.lineColor': '#333333',
      'scalesProperties.textColor': '#979797',
      'paneProperties.vertGridProperties.color': '#333333',
      'paneProperties.horzGridProperties.color': '#333333',
    },
    light: {
      'paneProperties.background': '#ffffff',
      'paneProperties.gridProperties.color': '#e6e6e6',
      'scalesProperties.backgroundColor': '#ffffff',
    },
  },
  loadingScreen: {
    dark: {
      backgroundColor: '#1a1a1a',
    },
    light: {
      backgroundColor: '#ffffff',
    },
  },
  studiesOverrides: {
    // 'volume.volume.color.0': '#00FFFF',
    // 'volume.volume.color.1': '#0000FF',
    // 'volume.volume.transparency': 70,
    // 'volume.volume ma.color': '#FF0000',
    // 'volume.volume ma.transparency': 30,
    // 'volume.show ma': true,
    // 'volume.options.showStudyArguments': true,
    // 'bollinger bands.median.color': '#33FF88',
    // 'bollinger bands.upper.linewidth': 7,
  },
}

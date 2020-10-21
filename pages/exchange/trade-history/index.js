import React from 'react'
import { useIntl } from 'react-intl'
import { withFixedDecimalPoint } from 'utils/math'
import PropTypes from 'prop-types'
import { Row } from 'antd'
import cx from 'classnames'
import moment from 'moment'
import { List, AutoSizer } from 'react-virtualized'

import { Loading } from 'asset/icons'
import styles from './index.module.scss'

const renderRow = ({ history, volDLen, decimal }) => ({
  index,
  key,
  style,
}) => {
  const item = history[history.length - index - 1]

  if (!item) {
    return null
  }

  return (
    <Row
      type="flex"
      justify="space-between"
      className={styles.historyTable}
      key={key}
      style={style}
    >
      <span
        className={cx(styles.price, {
          [styles.isBuyer]: item.isMarketMaker,
        })}
      >
        {withFixedDecimalPoint(item.value, decimal)}
      </span>
      <span className={cx(styles.quantity, 'textMain')}>
        {withFixedDecimalPoint(item.volume, volDLen)}
      </span>
      <span className={styles.time}>
        {moment(item.tradeTime).format('HH:mm:ss')}
      </span>
    </Row>
  )
}

const TradeHistory = ({ history, volDLen, decimal, loading, theme }) => {
  const intl = useIntl()

  return (
    <div className={styles.tradeHistory}>
      <div className={styles.header}>
        <h2 className={cx(styles.title, 'textMain')}>
          {intl.formatMessage({
            id: 'exchange.trade_history.title',
            defaultMessage: 'Trade history',
          })}
        </h2>
      </div>
      <div className={styles.historyPanel}>
        <AutoSizer>
          {({ height, width }) => {
            const rowCount = history.length || 26
            const rowHeight = height / 26

            return (
              <List
                className={cx('listWrapper', 'bordered')}
                width={width}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                rowRenderer={renderRow({
                  history,
                  volDLen,
                  decimal,
                  formatNumber: intl.formatNumber,
                })}
              />
            )
          }}
        </AutoSizer>
        {loading && (
          <div className={cx(styles.loading, styles[theme])}>
            <Loading width={40} height={40} fill="#3983fa" />
          </div>
        )}
      </div>
    </div>
  )
}

TradeHistory.propTypes = {
  history: PropTypes.array.isRequired,
  volDLen: PropTypes.number.isRequired,
  decimal: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
}

export default TradeHistory

import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { getFormatOption } from 'utils/math'

import styles from './index.module.scss'

export default function MedianBar({ data, decimals }) {
  const intl = useIntl()

  return (
    <div className={cx(styles.root, 'lightbg')}>
      <div className={cx(styles.valueWrapper, 'textMain')}>
        <strong>
          <span
            className={cx(styles.lastPrice, {
              [styles.up]: data.isValueUp,
              [styles.down]: data.isValueDown,
            })}
          >
            {data.value
              ? intl.formatNumber(data.value, getFormatOption(decimals.end))
              : '-'}
          </span>
        </strong>
        {/* <span className={cx(styles.lastPrice2)}> */}
        {/*   $ {withLimitDecimalPoint(data.value, decimals.end - 2)} */}
        {/* </span> */}
      </div>
      {/* More and signal icon */}
      {/* <div>
        <a href="/orderbook/BTC_USDT" className={cx(styles.more, 'textMain')}>
          More
        </a>
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANAQMAAACegKxaAAAABlBMVEX///9wqABn7Y3PAAAAAXRSTlMAQObYZgAAABVJREFUeAFjYGA8AMGWEMwOxc9xYwCK0hKVZHF1MQAAAABJRU5ErkJggg=="
          alt="Market Status: Running"
          title="Market Status: Running"
          className={styles.steps}
        />
      </div> */}
    </div>
  )
}

MedianBar.propTypes = {
  data: PropTypes.object.isRequired,
  decimals: PropTypes.object.isRequired,
}

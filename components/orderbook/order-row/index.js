import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { useIntl } from 'react-intl'
import { getFormatOption } from 'utils/math'

import styles from './index.module.scss'

export default function OrderRow({
  volume,
  sumValue,
  value,
  diffPart,
  samePart,
  style,
  index,
  type,
  percent,
  vDecimal,
}) {
  const [active, setActive] = useState(false)
  const intl = useIntl()

  return value === 'dummy' ? (
    <div
      className={cx(styles.fill, 'textMain', {
        [styles.active]: active,
        [styles.ask]: type === 'ASK',
        [styles.bid]: type === 'BID',
      })}
      style={style}
    >
      <div className={cx(styles.value)}>-</div>
      <div className={cx(styles.volume, styles.textRight)}>-</div>
      <div className={cx(styles.total, styles.textRight)}>-</div>
    </div>
  ) : (
    <div
      className={cx(styles.fill, 'textMain', {
        active,
        darkbgSeries: type === 'BID',
        [styles.ask]: type === 'ASK',
        [styles.bid]: type === 'BID',
      })}
      style={{
        ...style,
        backgroundSize: `${percent}% 100%`,
      }}
      data-tip={`${type}|${index}`}
      onBlur={() => {}}
      onFocus={() => {}}
      onMouseOver={() => setActive(true)}
      onMouseOut={() => setActive(false)}
    >
      <div className={cx(styles.value)}>
        <span className={styles.same}>{samePart}</span>
        <span className={styles.diff}>{diffPart}</span>
      </div>
      <div className={cx(styles.volume, styles.textRight)}>
        {intl.formatNumber(volume, getFormatOption(vDecimal))}
      </div>
      <div className={cx(styles.total, styles.textRight)}>
        {intl.formatNumber(sumValue, getFormatOption(8))}
      </div>
    </div>
  )
}

OrderRow.defaultProps = {
  index: 0,
  value: 0,
  volume: '0',
  sumValue: 0,
  style: {},
  samePart: '0',
  diffPart: '0',
  type: 'ASK',
  percent: 0,
  vDecimal: 0,
}

OrderRow.propTypes = {
  index: PropTypes.number,
  value: PropTypes.any,
  volume: PropTypes.string,
  sumValue: PropTypes.number,
  style: PropTypes.object,
  samePart: PropTypes.string,
  diffPart: PropTypes.string,
  type: PropTypes.string,
  percent: PropTypes.number,
  vDecimal: PropTypes.number,
}

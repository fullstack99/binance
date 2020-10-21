import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { getFormatOption, withFixedDecimalPoint } from 'utils/math'

import styles from './index.module.scss'

export default function ToolTipInfo({
  value,
  volume,
  sum,
  base,
  quote,
  d,
  vd,
}) {
  const intl = useIntl()

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <span>Avg.Price:</span>
        <span>≈ {intl.formatNumber(value, getFormatOption(d))}</span>
      </div>
      <div className={styles.row}>
        <span>Sum {base.toUpperCase()}:</span>
        <span>{intl.formatNumber(withFixedDecimalPoint(volume, vd))}</span>
      </div>
      <div className={styles.row}>
        <span>Sum {quote.toUpperCase()}:</span>
        <span>{intl.formatNumber(sum, getFormatOption(8))}</span>
      </div>
    </div>
  )
}

ToolTipInfo.propTypes = {
  value: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
  sum: PropTypes.number.isRequired,
  base: PropTypes.string.isRequired,
  quote: PropTypes.string.isRequired,
  d: PropTypes.number.isRequired,
  vd: PropTypes.number.isRequired,
}

import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { configSelectors } from 'store/config'
import { useIntl } from 'react-intl'
import styles from './index.module.scss'

export default function GroupSelector({ values, value, onChange }) {
  const intl = useIntl()
  const locale = useSelector(configSelectors.language)

  return (
    <div className={styles.root}>
      <span className={cx(styles.groupLabel, 'textSecondary')}>
        {intl.formatMessage({
          id: 'exchange.order_book.groups',
          defaultMessage: 'groups',
        })}
      </span>
      <select
        className="bordered darkbg textMain"
        value={value}
        onChange={onChange}
      >
        {values.map((v, i) => (
          <option key={`group-select-${i}`} value={v}>
            {v}{' '}
            {intl.formatMessage({
              id: 'exchange.order_book.decimal',
              defaultMessage: 'decimal',
            })}
            {locale === 'en' && v > 1 ? 's' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

GroupSelector.defaultProps = {
  values: [],
  value: 0,
}

GroupSelector.propTypes = {
  values: PropTypes.array,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
}

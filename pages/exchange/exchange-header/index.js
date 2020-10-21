import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { Radio } from 'antd'
import { getFormatOption } from 'utils/math'
import { MoonIcon, SunIcon } from 'asset/icons'

import styles from './index.module.scss'

export default function ExchangeHeader({
  data,
  decimals,
  theme,
  onThemeChange,
}) {
  const intl = useIntl()
  let highPrice = 0
  let lowPrice = 0
  let volume = 0
  const priceChange = data.value - data.o
  const priceChangePercent = (priceChange / data.o) * 100
  const defaultFormatOption = getFormatOption(decimals.end)

  if (data.h) {
    highPrice = intl.formatNumber(data.h, defaultFormatOption)
  }
  if (data.l) {
    lowPrice = intl.formatNumber(data.l, defaultFormatOption)
  }
  if (data.q) {
    volume = intl.formatNumber(data.q, defaultFormatOption)
  }

  return (
    <div className={styles.root}>
      <div className={styles.block}>
        <div className={styles.title}>
          <span className={cx(styles.mainVolume, 'textMain')}>
            {data.base.toUpperCase()}
          </span>{' '}
          / {data.quote.toUpperCase()}
        </div>
      </div>
      <div className={styles.block}>
        <div className={styles.title}>
          {intl.formatMessage({
            id: 'exchange.last_price',
            defaultMessage: 'Last Price',
          })}
        </div>
        <div className={styles.price}>
          <span
            className={cx({
              textMain: !data.isValueUp && !data.isValueDown,
              [styles.up]: data.isValueUp,
              [styles.down]: data.isValueDown,
            })}
          >
            {data?.isValueUp}
            {data.value
              ? intl.formatNumber(data.value, defaultFormatOption)
              : '-'}
          </span>
        </div>
      </div>
      <div className={styles.block}>
        <div className={styles.title}>
          {intl.formatMessage({
            id: 'exchange.24change',
            defaultMessage: '24h change',
          })}
        </div>
        <div className={styles.price}>
          <span
            className={cx({
              textMain: priceChange === 0,
              [styles.up]: priceChange > 0,
              [styles.down]: priceChange < 0,
            })}
          >
            {priceChange
              ? intl.formatNumber(priceChange, defaultFormatOption)
              : '-'}
          </span>
          {priceChange !== 0 && (
            <span
              className={cx({
                textMain: priceChangePercent === 0,
                [styles.up]: priceChangePercent > 0,
                [styles.down]: priceChangePercent < 0,
              })}
            >
              {priceChangePercent < 0 && ''}
              {priceChangePercent > 0 && '+'}
              {priceChangePercent
                ? `${intl.formatNumber(
                    priceChangePercent,
                    getFormatOption(2),
                  )}%`
                : ''}
            </span>
          )}
        </div>
      </div>
      <div className={styles.block}>
        <div className={styles.title}>
          {intl.formatMessage({
            id: 'exchange.24high',
            defaultMessage: '24h High',
          })}
        </div>
        <div className={cx(styles.price, 'textMain')}>
          <span>{highPrice || '-'}</span>
        </div>
      </div>
      <div className={styles.block}>
        <div className={styles.title}>
          {intl.formatMessage({
            id: 'exchange.24low',
            defaultMessage: '24h Low',
          })}
        </div>
        <div className={cx(styles.price, 'textMain')}>
          <span>{lowPrice || '-'}</span>
        </div>
      </div>
      <div className={styles.block}>
        <div className={styles.title}>
          {intl.formatMessage({
            id: 'exchange.24volume',
            defaultMessage: '24h Volume',
          })}
        </div>
        <div className={cx(styles.price, 'textMain')}>
          <span>{volume ? `${volume} ${data.quote.toUpperCase()}` : '-'}</span>
        </div>
      </div>
      <div className={styles.block}>
        <Radio.Group
          size="small"
          className={styles.themeBtnGroup}
          onChange={e => onThemeChange(e.target.value)}
          value={theme}
        >
          <Radio.Button
            className={cx(styles[theme], {
              [styles.active]: theme === 'light',
            })}
            style={{ borderRight: 'none' }}
            value="light"
          >
            <SunIcon width={20} height={24} />
          </Radio.Button>
          <Radio.Button
            className={cx(styles[theme], { [styles.active]: theme === 'dark' })}
            value="dark"
          >
            <MoonIcon width={16} height={24} />
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  )
}

ExchangeHeader.propTypes = {
  data: PropTypes.object.isRequired,
  decimals: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired,
}

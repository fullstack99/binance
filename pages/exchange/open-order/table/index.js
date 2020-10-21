import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { Table } from 'components/table'
import { withFixedDecimalPoint, percentage } from 'utils/math'
import get from 'lodash/get'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import cx from 'classnames'
import styles from './index.module.scss'

export default function OpenOrdersTable({
  loading,
  dataSource,
  error,
  pair,
  onCancel,
  isLoggedIn,
  theme,
}) {
  const intl = useIntl()
  const [coin, currency] = pair.toUpperCase().split('_')
  const columns = [
    {
      title: intl.formatMessage({ id: 'date' }),
      dataIndex: 'created_at',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      defaultSortOrder: 'descend',
      width: '250px',
    },
    {
      title: intl.formatMessage({ id: 'pair' }),
      render: () => `${coin}/${currency}`,
      width: '115px',
    },
    {
      title: intl.formatMessage({ id: 'type' }),
      dataIndex: 'type',
      render: () => <span>{intl.formatMessage({ id: 'limit' })}</span>,
      width: '105px',
    },
    {
      title: intl.formatMessage({ id: 'side' }),
      dataIndex: 'side',
      width: '90px',
      render: text => (
        <span className={styles[`side_${text}`]}>
          {intl.formatMessage({ id: text })}
        </span>
      ),
    },
    {
      title: (
        <span className={styles.alignRight}>
          {intl.formatMessage({ id: 'price' })}
        </span>
      ),
      dataIndex: 'price',
      render: text => `${text} ${currency}`,
      align: 'right',
      width: '150px',
    },
    {
      title: (
        <span className={styles.alignRight}>
          {intl.formatMessage({ id: 'amount' })}
        </span>
      ),
      dataIndex: 'amount',
      render: text => `${text} ${coin}`,
      align: 'right',
      width: '200px',
    },
    {
      title: (
        <span className={styles.alignRight}>
          {intl.formatMessage({ id: 'filled' })} (%)
        </span>
      ),
      render: data =>
        `${withFixedDecimalPoint(
          percentage((data.amount - data.remaining_amount) / data.amount),
          2,
        )}%`,
      align: 'right',
      width: '150px',
    },
    {
      title: (
        <span className={styles.alignRight}>
          {intl.formatMessage({ id: 'total' })}
        </span>
      ),
      render: data =>
        `${new BigNumber(data.price).multipliedBy(data.amount).toFixed(8)}`,
      align: 'right',
      width: '180px',
    },
    {
      title: intl.formatMessage({ id: 'action' }),
      render: order => (
        <a
          href="/#"
          onClick={e => {
            e.preventDefault()
            onCancel(order)
          }}
          className={styles.cancel}
        >
          {intl.formatMessage({ id: 'cancel' })}
        </a>
      ),
    },
  ]

  return (
    <Table
      className={cx(
        isLoggedIn
          ? styles.openTableContainer
          : styles.openTableContainerNotLogin,
        styles[theme],
      )}
      rowKey="id"
      columns={columns}
      pagination={false}
      loading={loading}
      error={error}
      dataSource={get(dataSource, 'items', [])}
    />
  )
}

OpenOrdersTable.defaultProps = {
  error: null,
  dataSource: {},
}

OpenOrdersTable.propTypes = {
  dataSource: PropTypes.shape({
    count: PropTypes.number,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        price: PropTypes.string,
        amount: PropTypes.string,
        remaining_amount: PropTypes.string,
        side: PropTypes.oneOf(['buy', 'sell']),
        cost: PropTypes.string,
        created_at: PropTypes.string,
        status: PropTypes.oneOf([
          'created',
          'not_enough_fund',
          'completed',
          'cancelled',
        ]),
      }),
    ),
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  pair: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
}

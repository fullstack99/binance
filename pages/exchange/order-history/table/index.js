import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { Table } from 'components/table'
import { Tag } from 'components/data-display'
import { withFixedDecimalPoint, percentage } from 'utils/math'
import BigNumber from 'bignumber.js'
import cx from 'classnames'
import get from 'lodash/get'
import styles from './index.module.scss'

const orderStatus = {
  created: true,
  cancelled: true,
  not_enough_fund: true,
  completed: true,
}

export default function OrderHistoryTable({
  loading,
  dataSource,
  error,
  pair,
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
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'status',
      render: text => {
        if (orderStatus[text]) {
          return (
            <Tag className={cx(styles.createdTag, styles[theme])} name={text}>
              {intl.formatMessage({ id: text })}
            </Tag>
          )
        }
        return <Tag name="unknown">{intl.formatMessage({ id: 'unknown' })}</Tag>
      },
    },
  ]
  return (
    <Table
      className={cx(
        isLoggedIn
          ? styles.historyTableContainer
          : styles.historyTableContainerNotLogin,
        styles[theme],
      )}
      rowKey="id"
      columns={columns}
      pagination={false}
      loading={loading}
      error={error}
      dataSource={get(dataSource, 'items', [])}
      rowClassName={record =>
        record.status === 'cancelled' ? styles.cancelled_row : null
      }
    />
  )
}

OrderHistoryTable.defaultProps = {
  error: null,
  dataSource: {},
}

OrderHistoryTable.propTypes = {
  dataSource: PropTypes.shape({
    id: PropTypes.number,
    price: PropTypes.string,
    amount: PropTypes.string,
    remaining_amount: PropTypes.string,
    side: PropTypes.string,
    cost: PropTypes.string,
    created_at: PropTypes.string,
    status: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  pair: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
}

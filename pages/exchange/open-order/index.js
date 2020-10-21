import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { Typography } from 'antd'
import { ordersActions, ordersSelectors } from 'store/orders'
import { useConfirmationMessageModal } from 'hooks/message-modal'
import { useInfoNotification } from 'hooks/notification'
import { exchangeSelectors } from 'store/exchange'
import useUser from 'hooks/user'
import OpenOrdersTable from './table'
import styles from '../index.module.scss'

const { Title } = Typography

export default function OpenOrders({ refresh, setRefresh, theme }) {
  const intl = useIntl()
  const [user] = useUser()
  const userLoggedIn = user.isAuthenticated
  const showConfirmationMessage = useConfirmationMessageModal()
  const showInfoNotification = useInfoNotification()
  const dispatch = useDispatch()
  const asset = useSelector(exchangeSelectors.orderbook)
  const baseAsset = asset.baseAsset.toLowerCase()
  const basePairValue = `${baseAsset}_thb`
  const { loading, error, data } = useSelector(ordersSelectors.orders)
  const [cancellingOrder, updateCancellingOrder] = useState(false)

  const fetchOpenOrders = useCallback(() => {
    dispatch(
      ordersActions.fetch.start({
        pair: basePairValue,
        side: 'all',
        status: 'open',
      }),
    )
  }, [dispatch, basePairValue])

  useEffect(() => {
    if (userLoggedIn) {
      fetchOpenOrders()
    }
  }, [userLoggedIn, fetchOpenOrders])

  useEffect(() => {
    if (refresh) {
      fetchOpenOrders()
      setRefresh(false)
    }
  }, [refresh, setRefresh, fetchOpenOrders])

  const cancelOrder = useCallback(
    (id, pair) => {
      dispatch(ordersActions.cancel.start({ id, pair }))
    },
    [dispatch],
  )

  const handleCancelOrder = order => {
    const [coin, currency] = basePairValue.toUpperCase().split('_')
    showConfirmationMessage({
      content: (
        <div className={styles.cancel_confiramtion}>
          <Title level={4} className={styles.confiramtion_title}>
            {intl.formatMessage({ id: 'confirmation' })}
          </Title>
          <p>{intl.formatMessage({ id: 'your_order_will_be_deleted' })}</p>
          <p>
            {intl.formatMessage({ id: 'price' })}: {order.price} {currency},{' '}
            {intl.formatMessage({ id: 'amount' })}: {order.amount} {coin}
          </p>
        </div>
      ),
      onOk: () => {
        updateCancellingOrder(true)
        cancelOrder(order.id, basePairValue)
        setTimeout(() => {
          setRefresh(true)
        }, 1000)
      },
    })
  }

  useEffect(() => {
    if (cancellingOrder && !loading) {
      if (!error) {
        showInfoNotification({
          message: intl.formatMessage({ id: 'order_deleted' }),
        })
      }
      updateCancellingOrder(false)
    }
  }, [cancellingOrder, error, intl, loading, showInfoNotification])

  return (
    <div className={styles.container}>
      <OpenOrdersTable
        loading={loading}
        dataSource={data}
        error={error}
        pair={basePairValue}
        onCancel={handleCancelOrder}
        isLoggedIn={userLoggedIn}
        theme={theme}
      />
    </div>
  )
}

OpenOrders.propTypes = {
  setRefresh: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
}

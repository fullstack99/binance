import React, { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ordersExchangeActions, exchangeSelectors } from 'store/exchange'
import useUser from 'hooks/user'
import PropTypes from 'prop-types'
import OrderHistoryTable from './table'
import styles from '../index.module.scss'

export default function OrderHistory({ refresh, setRefresh, theme }) {
  const dispatch = useDispatch()
  const [user] = useUser()
  const userLoggedIn = user.isAuthenticated
  const asset = useSelector(exchangeSelectors.orderbook)
  const baseAsset = asset.baseAsset.toLowerCase()
  const basePairValue = `${baseAsset}_thb`
  const { loading, error, data } = useSelector(exchangeSelectors.ordersExchange)

  const fetchHistoryOrders = useCallback(() => {
    dispatch(
      ordersExchangeActions.fetch.start({
        pair: basePairValue,
      }),
    )
  }, [dispatch, basePairValue])

  useEffect(() => {
    if (userLoggedIn) {
      fetchHistoryOrders()
    }
  }, [userLoggedIn, fetchHistoryOrders])

  useEffect(() => {
    if (refresh) {
      fetchHistoryOrders()
      setRefresh(false)
    }
  }, [refresh, setRefresh, fetchHistoryOrders])

  return (
    <div className={styles.container}>
      <OrderHistoryTable
        loading={loading}
        dataSource={data}
        error={error}
        pair={basePairValue}
        isLoggedIn={userLoggedIn}
        theme={theme}
      />
    </div>
  )
}

OrderHistory.propTypes = {
  setRefresh: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  refresh: PropTypes.bool.isRequired,
}

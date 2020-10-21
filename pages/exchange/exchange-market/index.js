import React, { useEffect, useCallback } from 'react'
import { Tabs, Tooltip } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { exchangeSelectors } from 'store/exchange'
import { feesActions, feesSelectors } from 'store/fees'
import cx from 'classnames'
import { CalculatorIcon } from 'asset/icons'
import PropTypes from 'prop-types'
import useUser from 'hooks/user'
import get from 'lodash/get'
import Tooltips from './Tooltips'
import LimitOrder from './LimitOrder'
import styles from './index.module.scss'

const { TabPane } = Tabs

function ExchangeMarket({ theme, baseAssetPrecision, quoteAssetPrecision }) {
  const [user, { fetchUser }] = useUser()
  const userLoggedIn = user.isAuthenticated
  const intl = useIntl()
  const dispatch = useDispatch()
  const asset = useSelector(exchangeSelectors.orderbook)
  const { data } = useSelector(feesSelectors.fees)
  const { baseAsset } = asset
  const { quoteAsset } = asset
  const quoteAvailableBalance = get(
    user,
    `wallets.${quoteAsset}.available_balance`,
    null,
  )
  const baseAvailableBalance = get(
    user,
    `wallets.${baseAsset}.available_balance`,
    null,
  )

  const fetchFees = useCallback(() => {
    dispatch(feesActions.fetch.start(`${baseAsset.toUpperCase()}_THB`))
  }, [dispatch, baseAsset])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (userLoggedIn) {
      fetchFees()
    }
  }, [userLoggedIn])

  return (
    <div className={styles.calContainer}>
      <Tooltip
        overlayClassName={cx(styles.tooltipCustom, styles[theme])}
        title={<Tooltips fees={data} userLoggedIn={userLoggedIn} />}
      >
        <div className={styles.calIcon}>
          <CalculatorIcon className={cx(styles.icon, 'svg')} />
        </div>
      </Tooltip>
      <Tabs
        className="tabPaneOutter"
        defaultActiveKey="ExchangeMarket"
        type="card"
      >
        <TabPane
          tab={intl.formatMessage({
            id: 'exchange.exchange_market.title',
            defaultMessage: 'Exchange',
          })}
          key="ExchangeMarket"
        >
          {/* Tab Level 2  */}
          <Tabs
            size="small"
            defaultActiveKey="limit"
            animated={false}
            type="line"
            className="tabPaneInner"
          >
            <TabPane
              className="bordered"
              tab={intl.formatMessage({
                id: 'exchange.exchange_market.limit',
                defaultMessage: 'Limit',
              })}
              key="limit"
            >
              <LimitOrder
                fees={data}
                theme={theme}
                baseAssetPrecision={baseAssetPrecision}
                quoteAssetPrecision={quoteAssetPrecision}
                userLoggedIn={userLoggedIn}
                quoteAvailableBalance={quoteAvailableBalance}
                baseAvailableBalance={baseAvailableBalance}
                baseAsset={baseAsset}
                quoteAsset={quoteAsset}
              />
            </TabPane>
            {/* <TabPane tab="Market" key="ExchangeMarket">
              <Row className={styles.comingsoonContainer}>
                <Col span={6} className={styles.comingsoonPic}>
                  <img
                    className={styles.comingsoonPic}
                    src={commingSoonImage}
                    alt="comming soon"
                  />
                </Col>
                <Col span={18} className={styles.comingsoonContent}>
                  <h3>Coming Soon</h3>
                  <p className="textMain">
                    Market order is a buy or sell order to be executed
                    immediately at the current market prices. As long as there
                    are willing sellers and buyers, market orders are filled.
                    Market orders are used when certainly of execution is a
                    priority over the price of execution.
                  </p>
                </Col>
              </Row>
            </TabPane> */}
          </Tabs>
        </TabPane>
        {/* <TabPane tab="Margin" key="margin">
          <Row className={styles.comingsoonContainer}>
            <Col span={6} className={styles.comingsoonPic}>
              <img
                className={styles.comingsoonPic}
                src={commingSoonImage}
                alt="comming soon"
              />
            </Col>
            <Col span={18} className={styles.comingsoonContent}>
              <h3>Coming Soon</h3>
              <p className="textMain">
                Margin trading confers a greater profit potential than
                traditional trading, bit also greater risk. Plrase be aware that
                in the event of exthreme market volatolity, there is even risk
                that your assets may be liquidated.
              </p>
            </Col>
          </Row>
        </TabPane> */}
      </Tabs>
    </div>
  )
}

ExchangeMarket.defaultProps = {
  theme: null,
}

ExchangeMarket.propTypes = {
  theme: PropTypes.string,
  baseAssetPrecision: PropTypes.number.isRequired,
  quoteAssetPrecision: PropTypes.number.isRequired,
}
export default ExchangeMarket

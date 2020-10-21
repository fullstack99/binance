import React from 'react'
import { Row, Col } from 'antd'
import cx from 'classnames'

import PropTypes from 'prop-types'
import result from 'lodash/result'
import BuyLimitOrder from './BuyLimitOrder'
import SellLimitOrder from './SellLimitOrder'
import styles from './index.module.scss'

function LimitOrder({
  fees,
  theme,
  baseAssetPrecision,
  quoteAssetPrecision,
  quoteAvailableBalance,
  baseAvailableBalance,
  baseAsset,
  quoteAsset,
  userLoggedIn,
}) {
  return (
    <>
      <Row className={styles.limitorder}>
        <Col
          span={12}
          className={cx(styles.limitorderCol, styles.left, 'leftDivider')}
        >
          <BuyLimitOrder
            isLogedIn={userLoggedIn}
            balance={Number(quoteAvailableBalance)}
            baseAsset={result(baseAsset, 'toUpperCase', '')}
            quoteAsset={result(quoteAsset, 'toUpperCase', '')}
            fees={fees}
            theme={theme}
            baseAssetPrecision={baseAssetPrecision}
            quoteAssetPrecision={quoteAssetPrecision}
          />
        </Col>
        <Col span={12} className={styles.limitorder}>
          <SellLimitOrder
            isLogedIn={userLoggedIn}
            balance={Number(baseAvailableBalance)}
            baseAsset={result(baseAsset, 'toUpperCase', '')}
            quoteAsset={result(quoteAsset, 'toUpperCase', '')}
            fees={fees}
            theme={theme}
            baseAssetPrecision={baseAssetPrecision}
            quoteAssetPrecision={quoteAssetPrecision}
          />
        </Col>
      </Row>
    </>
  )
}

LimitOrder.defaultProps = {
  fees: null,
  quoteAvailableBalance: null,
  baseAvailableBalance: null,
}

LimitOrder.propTypes = {
  fees: PropTypes.object,
  theme: PropTypes.string.isRequired,
  baseAssetPrecision: PropTypes.number.isRequired,
  quoteAssetPrecision: PropTypes.number.isRequired,
  quoteAvailableBalance: PropTypes.string,
  baseAvailableBalance: PropTypes.string,
  baseAsset: PropTypes.string.isRequired,
  quoteAsset: PropTypes.string.isRequired,
  userLoggedIn: PropTypes.bool.isRequired,
}

export default LimitOrder

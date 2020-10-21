import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import { SearchOutlined, StarFilled } from '@ant-design/icons'
import { Row, Radio, Input } from 'antd'
import { favoriteSelectors, favoriteActions } from 'store/favorite'
import cx from 'classnames'
import CoinTable from 'components/market-selector/CoinTable'
import styles from './index.module.scss'

const MarketSelector = ({ tickers, theme, baseAssetPrecision }) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('thb')
  const [coinFilter, setCoinFilter] = useState('')
  const [showType, setShowType] = useState('CHANGE')
  const initFavorite = useSelector(favoriteSelectors.favorite)

  const handleFavorites = (e, ticker) => {
    e.stopPropagation()
    if (!initFavorite.includes(ticker)) {
      dispatch(favoriteActions.favorite([...initFavorite, ticker]))
    } else {
      dispatch(
        favoriteActions.favorite(initFavorite.filter(item => item !== ticker)),
      )
    }
  }
  const handleCoinTypeClick = e => {
    setFilter(e.target.value)
  }
  const handleCoinFilter = e => {
    setCoinFilter(e.target.value)
  }
  const handleShowTypeChange = e => {
    setShowType(e.target.value)
  }

  return (
    <div className={styles.root}>
      <div className={cx(styles.header, 'lightbg')}>
        <Row type="flex" justify="space-between">
          <div className={styles.btnCoinGroup}>
            <Radio.Group
              size="small"
              onChange={handleCoinTypeClick}
              value={filter}
            >
              <Radio.Button value="FAVORITE" className={styles.usdt}>
                <StarFilled />
              </Radio.Button>
              <Radio.Button className={styles.usdt} value="thb">
                THB
              </Radio.Button>
              {/* <Radio.Button value="usdt" className={styles.usdt}>
                USDT
              </Radio.Button>
              <Radio.Button value="btc">BTC</Radio.Button> */}
            </Radio.Group>
          </div>
        </Row>
      </div>
      <Row className={styles.filterGroup} type="flex" justify="space-between">
        <Input
          size="small"
          className="textSecondary bordered"
          onChange={handleCoinFilter}
          placeholder={intl.formatMessage({
            id: 'exchange.market_selector.search',
            defaultMessage: 'Search...',
          })}
          prefix={<SearchOutlined />}
        />
        <div className="show-type">
          <Radio.Group
            className="textMain"
            size="small"
            buttonStyle="solid"
            value={showType}
            onChange={handleShowTypeChange}
          >
            <Radio value="CHANGE">
              {intl.formatMessage({
                id: 'exchange.market_selector.change',
                defaultMessage: 'Change',
              })}
            </Radio>
            <Radio value="VOLUME">
              {intl.formatMessage({
                id: 'exchange.market_selector.volume',
                defaultMessage: 'Volume',
              })}
            </Radio>
          </Radio.Group>
        </div>
      </Row>
      <div>
        <CoinTable
          coinFilter={coinFilter}
          tickers={tickers}
          handleFavorites={handleFavorites}
          favorites={initFavorite}
          filter={filter}
          showType={showType}
          theme={theme}
          baseAssetPrecision={baseAssetPrecision}
        />
      </div>
    </div>
  )
}

MarketSelector.propTypes = {
  tickers: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
  baseAssetPrecision: PropTypes.number.isRequired,
}

export default MarketSelector

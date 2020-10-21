/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, Component, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Radio } from 'antd'
import { debounce, isEqual, mean } from 'lodash'
import Tooltip from 'react-tooltip'
import PropTypes from 'prop-types'
import { List, AutoSizer } from 'react-virtualized'
import cx from 'classnames'
import { OrderbookBoth, OrderbookAsk, OrderbookBid, Loading } from 'asset/icons'

import { exchangeSelectors } from 'store/exchange'
import { getArrayFromRange } from 'utils/math'

import isEmpty from 'lodash/isEmpty'
import OrderRow from './order-row'
import ToolTipInfo from './tool-tip'
import MedianBar from './median-bar'
import GroupSelector from './group-selector'

import styles from './index.module.scss'

const rowRenderer = ({ orders, decimal, vDecimal, type, rowCount }) => ({
  index,
  key,
  style,
}) => {
  let order = orders[index]
  if (rowCount > orders.length) {
    if (type === 'ASK') {
      order = orders[index - rowCount + orders.length]
    }
    if (!order) {
      return (
        <OrderRow
          key={key}
          index={index}
          type={type}
          value="dummy"
          style={style}
          decimal={decimal}
          vDecimal={vDecimal}
        />
      )
    }
  }

  return (
    <OrderRow
      key={key}
      index={index}
      type={type}
      style={style}
      decimal={decimal}
      vDecimal={vDecimal}
      {...order}
    />
  )
}

const rebuildTooltip = debounce(() => Tooltip.rebuild(), 200, {
  leading: false,
  trailing: true,
})

const getPartData = (data, decimal, volDLen, type) => {
  const result = []
  let cur = 0

  const part = {
    volume: 0,
    sumValue: 0,
    totalVolume: 0,
    totalSumValue: 0,
    totalValue: 0,
  }
  let lastSameValue = 0
  const diffLen = Math.max(decimal - 2, 0)
  const meanSumValue = mean(data.map(v => v.sumValue))

  let i = 0
  const multiplicator = 10 ** decimal
  const length = data?.length

  for (i; i >= 0 && i < length; i++) {
    const operator = type === 'ASK' ? Math.ceil : Math.floor
    const value = (
      operator(data[i].value * multiplicator) / multiplicator
    ).toFixed(decimal)

    if (i === 0 || i === length) {
      cur = value
    }
    // use decimal part when value is less than 1, otherwise just take subpart of integer
    const diffStr =
      diffLen === 0
        ? Math.floor(Number(cur)).toString()
        : cur.substr(0, cur.indexOf('.') + diffLen + 1)
    const sameValue =
      Number(cur) % 1 !== 0 ? diffStr : diffStr.substr(0, diffStr.length - 2)

    // sum by cutted value
    if (cur !== value || i === 0 || i === length) {
      if (lastSameValue !== sameValue) {
        // set whole part as different, emphasize it
        lastSameValue = sameValue
        part.samePart = ''
        part.diffPart = cur
      } else {
        // set same and diff part
        part.samePart = sameValue
        part.diffPart = cur.slice(sameValue.length)
      }

      part.totalValue += Number(part.value || 0)
      part.totalSumValue += part.sumValue
      part.totalVolume = Number(part.totalVolume) + Number(part.volume)
      part.avgValue = part.totalValue / (result.length + 1) + Number.EPSILON

      if (i !== 0 && i !== length) {
        cur = value
        part.volume = part.volume.toFixed(volDLen)
        result.push({ ...part })
        // if (type === 'ASK') {
        //   result.unshift({ ...part })
        // } else {
        //   result.push({ ...part })
        // }

        // clear volume and sumValue for next grouping
        part.volume = 0
        part.sumValue = 0
      }
    }

    part.value = value
    part.volume = Number(part.volume) + data[i].volume
    part.sumValue += data[i].value * data[i].volume
    part.percent = (data[i].sumValue / meanSumValue) * 50
  }

  // handle the case for last group
  if (part.diffPart) {
    const operator = type === 'ASK' ? 'unshift' : 'push'
    result[operator]({
      ...part,
      avgValue: Math.round(part.avgValue * multiplicator) / multiplicator,
      volume: part.volume.toFixed(volDLen),
      diffPart: isEmpty(part.samePart) ? part.value : part.diffPart,
    })
  }

  return result
}

class ListWrapper extends Component {
  constructor() {
    super()
    this.state = {
      scrollTop: 0,
    }
  }

  isScrolled = false

  // eslint-disable-next-line
  componentWillReceiveProps(nextProps) {
    const { type, showType } = this.props

    if (type === 'ASK' && showType !== nextProps.showType) {
      this.setState({
        // scrollTop: nextProps.rowHeight * nextProps.orders.length,
        scrollTop: 0,
      })
      this.isScrolled = true
    }
  }

  shouldComponentUpdate(nextProps) {
    const { orders } = this.props

    if (this.isScrolled) {
      this.isScrolled = false
      return true
    }

    return !isEqual(nextProps.orders, orders)
  }

  onScroll = ({ scrollTop }) => {
    this.setState({ scrollTop })
    this.isScrolled = true
  }

  render() {
    const { orders, decimal, vDecimal, type, rowCount, ...others } = this.props
    const { scrollTop } = this.state
    return (
      <List
        {...others}
        rowCount={rowCount}
        scrollTop={scrollTop}
        rowRenderer={rowRenderer({
          orders,
          decimal,
          vDecimal,
          type,
          rowCount,
        })}
        onScroll={this.onScroll}
      />
    )
  }
}

const OrderBook = ({
  askData,
  bidData,
  trade,
  decimals,
  volDLen,
  theme,
  loading,
  baseAssetPrecision,
  quoteAssetPrecision,
}) => {
  const [baseAsset, setBaseAsset] = useState('')
  const [quoteAsset, setQuoteAsset] = useState('')
  const [type, setType] = useState('ALL_ORDER_LISTS')
  const [decimal, setDecimal] = useState(quoteAssetPrecision)
  const [decimalOptions, setDecimalOptions] = useState(
    getArrayFromRange(decimals.start, decimals.end),
  )
  const [askOrders, setAskOrders] = useState([])
  const [bidOrders, setBidOrders] = useState([])
  const [hoverType, setHoverType] = useState('ASK')
  const asset = useSelector(exchangeSelectors.orderbook)

  useEffect(() => {
    setBaseAsset(asset.baseAsset)
    setQuoteAsset(asset.quoteAsset)
  }, [asset.baseAsset, asset.quoteAsset])

  const handleTypeChange = clickType => {
    setType(clickType)
  }

  const handleDecimalChange = e => {
    setDecimal(parseInt(e.target.value, 10))
  }

  const onListHover = newHoverType => () => {
    setHoverType(newHoverType)
  }

  const handleContent = useCallback(
    dataTip => {
      Tooltip.rebuild()
      if (!dataTip) {
        return ''
      }

      const [tipType, i] = dataTip.split('|')
      const index = Number(i)
      let order
      if (tipType === 'ASK') {
        order =
          type === 'ALL_ORDER_LISTS'
            ? askOrders[askOrders.length - 19 + index]
            : askOrders[index]
      } else {
        order = bidOrders[index]
      }

      return order ? (
        <ToolTipInfo
          value={+order.avgValue}
          volume={+order.totalVolume}
          sum={+order.totalSumValue}
          base={baseAsset}
          quote={quoteAsset}
          d={decimal}
          vd={quoteAssetPrecision}
        />
      ) : null
    },
    [baseAsset, quoteAsset, decimal, volDLen, type, askOrders, bidOrders],
  )

  useEffect(() => {
    setDecimal(decimals.end)
  }, [decimals.end])

  useEffect(() => {
    setDecimalOptions(getArrayFromRange(decimals.start, decimals.end))
    setAskOrders(getPartData(askData, decimal, volDLen, 'ASK'))
    setBidOrders(getPartData(bidData, decimal, volDLen, 'BID'))
  }, [askData, bidData, decimal, decimals, volDLen, trade])

  return (
    <div className={cx(styles.root, 'bordered')}>
      <div className={cx(styles.setting, 'lightbg')}>
        <div className={styles.buttonGroup}>
          <Radio.Group size="large" defaultValue={0} buttonStyle="outline">
            <Radio.Button
              size="small"
              onClick={() => handleTypeChange('ALL_ORDER_LISTS')}
              value={0}
              className={styles.orderbookType}
            >
              <OrderbookBoth className={styles.svg} />
            </Radio.Button>
            <Radio.Button
              onClick={() => handleTypeChange('BID_ORDER_LIST')}
              value={2}
              className={styles.orderbookType}
            >
              <OrderbookBid className={styles.svg} />
            </Radio.Button>
            <Radio.Button
              size="small"
              onClick={() => handleTypeChange('ASK_ORDER_LIST')}
              value={1}
              className={styles.orderbookType}
            >
              <OrderbookAsk className={styles.svg} />
            </Radio.Button>
          </Radio.Group>
        </div>
        <div>
          <GroupSelector
            values={decimalOptions}
            value={decimal}
            onChange={handleDecimalChange}
          />
        </div>
      </div>
      <div className={cx(styles.header, 'textSecondary')}>
        <div
          className={styles.price}
        >{`Price(${quoteAsset.toUpperCase()})`}</div>
        <div
          className={cx(styles.amount, styles.textRight)}
        >{`Amount(${baseAsset.toUpperCase()})`}</div>
        <div
          className={cx(styles.total, styles.textRight)}
        >{`Total(${quoteAsset.toUpperCase()})`}</div>
      </div>
      <div className={cx(styles.container, styles.only)}>
        <AutoSizer
          style={{ width: '100%', height: '100%' }}
          onResize={rebuildTooltip}
        >
          {({ height, width }) => {
            let rowCount = 0
            let h = height - 29 // consider median bar height
            let rowHeight = 0
            let asks = askOrders
            let bids = bidOrders

            if (type === 'ALL_ORDER_LISTS') {
              rowCount = 19
              h = 384
              rowHeight = h / rowCount
              asks = askOrders.slice(askOrders.length - 19)
              bids = bidOrders.slice(0, 19)
            }
            if (type === 'ASK_ORDER_LIST') {
              rowCount = askOrders.length || 40
              rowHeight = h / 38
            }
            if (type === 'BID_ORDER_LIST') {
              rowCount = bidOrders.length || 40
              rowHeight = h / 38
            }
            return (
              <>
                <div
                  className={cx(styles.listRoot, {
                    [styles.show]:
                      type === 'ALL_ORDER_LISTS' || type === 'ASK_ORDER_LIST',
                  })}
                  onMouseOver={onListHover('ASK')}
                >
                  <ListWrapper
                    type="ASK"
                    className="listWrapper"
                    width={width}
                    height={h}
                    rowCount={rowCount}
                    rowHeight={rowHeight}
                    orders={asks}
                    decimal={decimal}
                    vDecimal={baseAssetPrecision}
                    onScroll={rebuildTooltip}
                    onMouseOver={onListHover('ASK')}
                    showType={type}
                  />
                  {loading && (
                    <div className={cx(styles.loading, styles[theme])}>
                      <Loading width={40} height={40} fill="#3983fa" />
                    </div>
                  )}
                </div>
                <MedianBar data={trade} decimals={decimals} />
                <div
                  className={cx(styles.listRoot, {
                    [styles.show]:
                      type === 'ALL_ORDER_LISTS' || type === 'BID_ORDER_LIST',
                  })}
                  onMouseOver={onListHover('BID')}
                >
                  <ListWrapper
                    type="BID"
                    className={cx('listWrapper', styles.bid)}
                    width={width}
                    height={h}
                    rowCount={rowCount}
                    rowHeight={rowHeight}
                    orders={bids}
                    decimal={decimal}
                    vDecimal={baseAssetPrecision}
                    onScroll={rebuildTooltip}
                  />
                  {loading && (
                    <div className={cx(styles.loading, styles[theme])}>
                      <Loading width={40} height={40} fill="#3983fa" />
                    </div>
                  )}
                </div>
              </>
            )
          }}
        </AutoSizer>
      </div>

      <Tooltip
        type="dark"
        effect="solid"
        backgroundColor={theme === 'light' ? '#262626' : '#616161'}
        offset={{ top: hoverType === 'ASK' ? 9 : -9 }}
        place="right"
        getContent={handleContent}
      />
    </div>
  )
}

OrderBook.propTypes = {
  askData: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
  bidData: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
  trade: PropTypes.object.isRequired,
  decimals: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  volDLen: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default OrderBook

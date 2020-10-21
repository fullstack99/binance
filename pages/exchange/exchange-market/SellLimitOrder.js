import React, { useState, useEffect, useCallback } from 'react'
import { Form, Button, InputNumber, Tooltip } from 'antd'
import { WalletExchangeIcon } from 'asset/icons'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { InfoCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { createOrdersActions } from 'store/orders'
import styles from './index.module.scss'
import LoginRegisterButton from './LoginRegisterButton'
import { TotalInfoTooltipSell } from './TotalInfoTooltip'

function SellLimitOrder(props) {
  const {
    isLogedIn,
    balance,
    baseAsset,
    quoteAsset,
    fees,
    theme,
    baseAssetPrecision,
    quoteAssetPrecision,
  } = props
  const intl = useIntl()
  const dispatch = useDispatch()
  const [sellPriceNumber, setSellPriceNumber] = useState(
    new BigNumber(200).toFixed(8),
  )
  const [sellAmountNumber, setSellAmountNumber] = useState()
  const [sellMaxAmountNumber, setSellMaxAmountNumber] = useState()
  const [sellAmountFocus, setSellAmountFocus] = useState(false)
  const [formSell] = Form.useForm()
  const [submitIsLoading, setSubmitIsLoading] = useState(false)
  const feePercentage = isLogedIn ? Number(fees.Taker) : 0.25
  const feeMultiplier = feePercentage <= 0 ? 1 : feePercentage
  const vatPercentage = 0.07
  const basePairValue = baseAsset.toLowerCase()

  const createOrder = useCallback(
    values => {
      dispatch(
        createOrdersActions.create.start({
          type: 'limit',
          pair: `${basePairValue}_thb`,
          side: 'sell',
          price: values.sellPriceInput.toString(),
          amount: values.sellAmountInput.toString(),
          nounce: +moment(),
        }),
      )
    },
    [basePairValue, dispatch],
  )

  const onFinish = values => {
    setSubmitIsLoading(true)
    createOrder(values)
    formSell.resetFields()
    setTimeout(() => {
      setSubmitIsLoading(false)
    }, 1500)
  }

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo)
  }

  const maxAmountVat = new BigNumber(sellPriceNumber)
    .multipliedBy(feeMultiplier)
    .multipliedBy(vatPercentage)
    .toFixed(8)
  const maxAmountfee = new BigNumber(sellPriceNumber)
    .multipliedBy(feePercentage)
    .toFixed(8)
  const maxAmountPrice = new BigNumber(sellPriceNumber)
    .plus(maxAmountfee)
    .plus(maxAmountVat)
    .toFixed(8)
  const maxAmount = new BigNumber(balance)
    .dividedBy(maxAmountPrice)
    .toFixed(baseAssetPrecision)

  useEffect(() => {
    setSellMaxAmountNumber(maxAmount)
  }, [maxAmount])

  const tradeFee = cost => {
    return new BigNumber(cost).multipliedBy(feePercentage).toFixed(8)
  }

  const tradeVat = fee => {
    return new BigNumber(fee).multipliedBy(vatPercentage).toFixed(8)
  }

  const tradeTotal = (cost, fee, vat) => {
    return new BigNumber(cost)
      .plus(fee)
      .plus(vat)
      .toFixed(8)
  }

  // Handle sell input form
  const onSellPriceChange = price => {
    const absPrice = new BigNumber(Math.abs(price)).toFixed(8)
    const cost = new BigNumber(absPrice)
      .multipliedBy(sellAmountNumber)
      .toFixed(8)
    const fee = tradeFee(cost)
    const vat = tradeVat(feeMultiplier)
    const total = tradeTotal(cost, fee, vat)
    formSell.setFieldsValue({
      sellPriceInput: absPrice,
      sellTotalInput:
        total === 'NaN' || total <= 0 || total === 'Infinity' ? '' : total,
    })
    setSellPriceNumber(absPrice)
  }

  const onSellAmountChange = value => {
    const amount = new BigNumber(Math.abs(value)).toFixed(8)
    setSellAmountNumber(amount)
    const cost = new BigNumber(sellPriceNumber).multipliedBy(amount).toFixed(8)
    const fee = tradeFee(cost)
    const vat = tradeVat(feeMultiplier)
    const total = tradeTotal(cost, fee, vat)
    formSell.setFieldsValue({
      sellAmountInput: Math.abs(amount).toFixed(8),
      sellTotalInput:
        new BigNumber(total).toFixed(8) <= 0 ||
        new BigNumber(total).toFixed(8) === 'NaN'
          ? ''
          : new BigNumber(total).toFixed(8),
    })
  }

  const setSellAmountQuarter = () => {
    const fee = tradeFee(sellPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(sellPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.25)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.25).toFixed(8),
    )
    if (isLogedIn) {
      setSellAmountNumber(formattedTotal)
      formSell.setFieldsValue({
        sellAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        sellTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setSellAmountHalf = () => {
    const fee = tradeFee(sellPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(sellPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.5)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.5).toFixed(8),
    )
    if (isLogedIn) {
      setSellAmountNumber(formattedTotal)
      formSell.setFieldsValue({
        sellAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        sellTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setSellAmountHalfQuarter = () => {
    const fee = tradeFee(sellPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(sellPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.75)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.75).toFixed(8),
    )
    if (isLogedIn) {
      setSellAmountNumber(formattedTotal)
      formSell.setFieldsValue({
        sellAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        sellTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setSellAmountMax = () => {
    const fee = tradeFee(sellPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(sellPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(totalAmount)
    if (isLogedIn) {
      setSellAmountNumber(totalAmount)
      formSell.setFieldsValue({
        sellAmountInput: totalAmount === 'Infinity' ? '' : totalAmount,
        sellTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }

  const handleShowMaxSellAmountFocus = () => {
    setSellAmountFocus(true)
  }
  const handleHideMaxSellAmountFocus = () => {
    setSellAmountFocus(false)
  }

  const onSellTotalChange = value => {
    const absValue = new BigNumber(Math.abs(value)).toFixed(8)
    const fee = tradeFee(sellPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(sellPriceNumber, fee, vat)
    setSellAmountNumber(
      new BigNumber(absValue).dividedBy(BigNumber(totalPrice)).toFixed(8),
    )
    formSell.setFieldsValue({
      sellAmountInput:
        absValue > 0 &&
        new BigNumber(absValue).dividedBy(totalPrice).toFixed(8) !== 'Infinity'
          ? new BigNumber(absValue).dividedBy(totalPrice).toFixed(8)
          : '',
      sellTotalInput:
        new BigNumber(absValue).toFixed(8) <= 0
          ? ''
          : new BigNumber(absValue).toFixed(8),
    })
  }

  return (
    <>
      <div className={cx(styles.header, 'textMain')}>
        <span className={cx(styles.headerTitle)}>
          {intl.formatMessage({
            id: 'exchange.exchange_market.sell',
            defaultMessage: 'Sell',
          })}{' '}
          {baseAsset}
        </span>
        <div className={cx(styles.headerWallet)}>
          <WalletExchangeIcon className={cx(styles.exchangeIcon, 'svg')} />{' '}
          {isLogedIn && balance ? intl.formatNumber(balance.toFixed(8)) : '-'}{' '}
          {baseAsset}
        </div>
      </div>
      <Form
        form={formSell}
        className={styles.form}
        layout="horizontal"
        name="sell"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          sellPriceInput: '',
          sellAmountInput: '',
        }}
      >
        <div className={styles.customPlaceholderWrapper}>
          <span className={cx(styles.customPlaceholder, 'textOther')}>
            {quoteAsset}
          </span>
        </div>
        <Form.Item
          label={intl.formatMessage({
            id: 'exchange.exchange_market.price',
            defaultMessages: 'Price',
          })}
          name="sellPriceInput"
          className={styles.formItem}
        >
          <InputNumber
            precision={quoteAssetPrecision}
            step={0.1}
            onChange={onSellPriceChange}
          />
        </Form.Item>
        <div className={styles.customPlaceholderWrapper}>
          <span className={cx(styles.customPlaceholder, 'textOther')}>
            {baseAsset}
          </span>
        </div>
        <Form.Item
          label={intl.formatMessage({
            id: 'exchange.exchange_market.amount',
            defaultMessages: 'Amount',
          })}
          name="sellAmountInput"
          className={styles.formItem}
        >
          <InputNumber
            onFocus={handleShowMaxSellAmountFocus}
            onBlur={handleHideMaxSellAmountFocus}
            precision={baseAssetPrecision}
            step={0.1}
            onChange={onSellAmountChange}
          />
        </Form.Item>
        <div className={styles.maxAmountContainer}>
          <p
            className={cx({
              [styles.maxAmount]: sellAmountFocus,
              [styles.maxAmountHide]: !sellAmountFocus,
            })}
          >
            Max Amount{' '}
            {sellMaxAmountNumber > 0 && sellMaxAmountNumber !== 'Infinity'
              ? sellMaxAmountNumber
              : ' - '}
          </p>
        </div>
        <Form.Item
          className={sellAmountFocus ? styles.maxAmountHide : styles.formItem}
        >
          <div className={styles.tradeOptionWrapper}>
            <Button
              onClick={setSellAmountQuarter}
              className={cx(
                styles.ButtonOption,
                'textMain',
                'darkbg',
                'bordered',
              )}
            >
              25%
            </Button>
            <Button
              onClick={setSellAmountHalf}
              className={cx(
                styles.ButtonOption,
                'textMain',
                'darkbg',
                'bordered',
              )}
            >
              50%
            </Button>
            <Button
              onClick={setSellAmountHalfQuarter}
              className={cx(
                styles.ButtonOption,
                'textMain',
                'darkbg',
                'bordered',
              )}
            >
              75%
            </Button>
            <Button
              onClick={setSellAmountMax}
              className={cx(
                styles.ButtonOption,
                'textMain',
                'darkbg',
                'bordered',
              )}
            >
              100%
            </Button>
          </div>
        </Form.Item>
        <div className={styles.customPlaceholderWrapper}>
          <span className={cx(styles.customPlaceholder, 'textOther')}>
            {quoteAsset}
          </span>
        </div>
        <Form.Item
          colon={false}
          label={
            <>
              {intl.formatMessage({
                id: 'exchange.exchange_market.total',
                defaultMessages: 'Total',
              })}
              {':'}
              <div className={styles.totalInfoWrapper}>
                <Tooltip
                  title={
                    <TotalInfoTooltipSell
                      sellPriceNumber={Number(sellPriceNumber)}
                      sellAmountNumber={Number(sellAmountNumber)}
                      feePercentage={feePercentage}
                      vatPercentage={vatPercentage}
                    />
                  }
                  overlayClassName={cx(
                    styles.totalTooltipCustom,
                    styles[theme],
                  )}
                >
                  <InfoCircleOutlined
                    className={styles.totalInfo}
                    style={{ color: '#8c8c8c' }}
                  />
                </Tooltip>
              </div>
            </>
          }
          name="sellTotalInput"
          className={styles.formItem}
          rules={[
            {
              validator: async (rule, value) => {
                if (value > balance) {
                  // eslint-disable-next-line no-throw-literal
                  throw (<FormattedMessage id="balance_is_not_enough" />)
                }
              },
            },
            {
              validator: async (rule, value) => {
                if ((!value && !sellPriceNumber) || sellPriceNumber <= 0) {
                  // eslint-disable-next-line no-throw-literal
                  throw 'Please input your correct price'
                } else if (
                  (!value && !sellAmountNumber) ||
                  sellAmountNumber <= 0
                ) {
                  // eslint-disable-next-line no-throw-literal
                  throw 'Please input your correct amount'
                } else if (!value || value <= 0) {
                  // eslint-disable-next-line no-throw-literal
                  throw 'Please input your correct total'
                }
              },
            },
          ]}
        >
          <InputNumber precision={8} step={0.1} onChange={onSellTotalChange} />
        </Form.Item>
        <Form.Item className={styles.formSubmit}>
          {isLogedIn ? (
            <Button
              loading={submitIsLoading}
              className={styles.caltradeSubmitSell}
              htmlType="submit"
            >
              {intl.formatMessage({
                id: 'exchange.exchange_market.sell',
                defaultMessage: 'Sell',
              })}{' '}
              {baseAsset}
            </Button>
          ) : (
            <LoginRegisterButton />
          )}
        </Form.Item>
      </Form>
    </>
  )
}

SellLimitOrder.propTypes = {
  isLogedIn: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired,
  baseAsset: PropTypes.string.isRequired,
  quoteAsset: PropTypes.string.isRequired,
  fees: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  baseAssetPrecision: PropTypes.number.isRequired,
  quoteAssetPrecision: PropTypes.number.isRequired,
}

export default SellLimitOrder

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
import { TotalInfoTooltipBuy } from './TotalInfoTooltip'

function BuyLimitOrder(props) {
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
  const [buyPriceNumber, setBuyPriceNumber] = useState(
    new BigNumber(200).toFixed(8),
  )
  const [buyAmountNumber, setBuyAmountNumber] = useState()
  const [buyMaxAmountNumber, setBuyMaxAmountNumber] = useState()
  const [buyAmountFocus, setBuyAmountFocus] = useState(false)
  const [submitIsLoading, setSubmitIsLoading] = useState(false)
  const [formBuy] = Form.useForm()
  const feePercentage = isLogedIn ? Number(fees.Maker) : 0.25
  const feeMultiplier = feePercentage <= 0 ? 1 : feePercentage
  const vatPercentage = 0.07
  const basePairValue = baseAsset.toLowerCase()

  const createOrder = useCallback(
    values => {
      dispatch(
        createOrdersActions.create.start({
          type: 'limit',
          pair: `${basePairValue}_thb`,
          side: 'buy',
          price: values.buyPriceInput.toString(),
          amount: values.buyAmountInput.toString(),
          nounce: +moment(),
        }),
      )
    },
    [basePairValue, dispatch],
  )

  const onFinish = values => {
    setSubmitIsLoading(true)
    createOrder(values)
    formBuy.resetFields()
    setTimeout(() => {
      setSubmitIsLoading(false)
    }, 1500)
  }

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo)
  }

  const maxAmountVat = new BigNumber(buyPriceNumber)
    .multipliedBy(feeMultiplier)
    .multipliedBy(vatPercentage)
    .toFixed(8)
  const maxAmountfee = new BigNumber(buyPriceNumber)
    .multipliedBy(feePercentage)
    .toFixed(8)
  const maxAmountPrice = new BigNumber(buyPriceNumber)
    .plus(maxAmountfee)
    .plus(maxAmountVat)
    .toFixed(8)
  const maxAmount = new BigNumber(balance)
    .dividedBy(maxAmountPrice)
    .toFixed(baseAssetPrecision)

  useEffect(() => {
    setBuyMaxAmountNumber(maxAmount)
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

  // Handle buy input form
  const onBuyPriceChange = price => {
    const absPrice = new BigNumber(Math.abs(price)).toFixed(8)
    const cost = new BigNumber(absPrice)
      .multipliedBy(buyAmountNumber)
      .toFixed(8)
    const fee = tradeFee(cost)
    const vat = tradeVat(feeMultiplier)
    const total = tradeTotal(cost, fee, vat)
    formBuy.setFieldsValue({
      buyPriceInput: absPrice,
      buyTotalInput:
        total === 'NaN' || total <= 0 || total === 'Infinity' ? '' : total,
    })
    setBuyPriceNumber(absPrice)
  }

  const onBuyAmountChange = value => {
    const amount = new BigNumber(Math.abs(value)).toFixed(8)
    setBuyAmountNumber(amount)
    const cost = new BigNumber(buyPriceNumber).multipliedBy(amount).toFixed(8)
    const fee = tradeFee(cost)
    const vat = tradeVat(feeMultiplier)
    const total = tradeTotal(cost, fee, vat)
    formBuy.setFieldsValue({
      buyAmountInput: Math.abs(amount).toFixed(8),
      buyTotalInput:
        new BigNumber(total).toFixed(8) <= 0 ||
        new BigNumber(total).toFixed(8) === 'NaN'
          ? ''
          : new BigNumber(total).toFixed(8),
    })
  }

  const setBuyAmountQuarter = () => {
    const fee = tradeFee(buyPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(buyPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.25)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.25).toFixed(8),
    )
    if (isLogedIn) {
      setBuyAmountNumber(formattedTotal)
      formBuy.setFieldsValue({
        buyAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        buyTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setBuyAmountHalf = () => {
    const fee = tradeFee(buyPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(buyPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.5)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.5).toFixed(8),
    )
    if (isLogedIn) {
      setBuyAmountNumber(formattedTotal)
      formBuy.setFieldsValue({
        buyAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        buyTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setBuyAmountHalfQuarter = () => {
    const fee = tradeFee(buyPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(buyPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const formattedTotal = new BigNumber(totalAmount)
      .multipliedBy(0.75)
      .toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(
      new BigNumber(totalAmount).multipliedBy(0.75).toFixed(8),
    )
    if (isLogedIn) {
      setBuyAmountNumber(formattedTotal)
      formBuy.setFieldsValue({
        buyAmountInput: formattedTotal === 'Infinity' ? '' : formattedTotal,
        buyTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }
  const setBuyAmountMax = () => {
    const fee = tradeFee(buyPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(buyPriceNumber, fee, vat)
    const totalAmount = new BigNumber(balance).dividedBy(totalPrice).toFixed(8)
    const totalPriceInput = new BigNumber(totalPrice).multipliedBy(totalAmount)
    if (isLogedIn) {
      setBuyAmountNumber(totalAmount)
      formBuy.setFieldsValue({
        buyAmountInput: totalAmount === 'Infinity' ? '' : totalAmount,
        buyTotalInput: totalPriceInput.c === null ? '' : totalPriceInput,
      })
    }
  }

  const handleShowMaxBuyAmountFocus = () => {
    setBuyAmountFocus(true)
  }
  const handleHideMaxBuyAmountFocus = () => {
    setBuyAmountFocus(false)
  }

  const onBuyTotalChange = value => {
    const absValue = new BigNumber(Math.abs(value)).toFixed(8)
    const fee = tradeFee(buyPriceNumber)
    const vat = tradeVat(feeMultiplier)
    const totalPrice = tradeTotal(buyPriceNumber, fee, vat)
    setBuyAmountNumber(
      new BigNumber(absValue).dividedBy(BigNumber(totalPrice)).toFixed(8),
    )

    formBuy.setFieldsValue({
      buyAmountInput:
        absValue > 0 &&
        new BigNumber(absValue).dividedBy(totalPrice).toFixed(8) !== 'Infinity'
          ? new BigNumber(absValue).dividedBy(totalPrice).toFixed(8)
          : '',
      buyTotalInput:
        new BigNumber(absValue).toFixed(8) <= 0
          ? ''
          : new BigNumber(absValue).toFixed(8),
    })
  }

  return (
    <>
      <div className={cx(styles.header, 'textMain')}>
        <span className={styles.headerTitle}>
          {intl.formatMessage({
            id: 'exchange.exchange_market.buy',
            defaultMessage: 'Buy',
          })}{' '}
          {baseAsset}
        </span>
        <div className={styles.headerWallet}>
          <WalletExchangeIcon className={cx(styles.exchangeIcon, 'svg')} />
          {isLogedIn && balance
            ? intl.formatNumber(balance.toFixed(8))
            : '-'}{' '}
          {quoteAsset}
        </div>
      </div>
      <Form
        form={formBuy}
        className={styles.form}
        layout="horizontal"
        name="buy"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          buyPriceInput: '',
          buyAmountInput: '',
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
          name="buyPriceInput"
          className={styles.formItem}
        >
          <InputNumber
            precision={quoteAssetPrecision}
            step={0.1}
            onChange={onBuyPriceChange}
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
          name="buyAmountInput"
          className={styles.formItem}
        >
          <InputNumber
            onFocus={handleShowMaxBuyAmountFocus}
            onBlur={handleHideMaxBuyAmountFocus}
            precision={baseAssetPrecision}
            step={0.1}
            onChange={onBuyAmountChange}
          />
        </Form.Item>
        <div className={styles.maxAmountContainer}>
          <p
            className={cx({
              [styles.maxAmount]: buyAmountFocus,
              [styles.maxAmountHide]: !buyAmountFocus,
            })}
          >
            Max Amount{' '}
            {buyMaxAmountNumber > 0 && buyMaxAmountNumber !== 'Infinity'
              ? buyMaxAmountNumber
              : ' - '}
          </p>
        </div>
        <Form.Item
          className={buyAmountFocus ? styles.maxAmountHide : styles.formItem}
        >
          <div className={styles.tradeOptionWrapper}>
            <Button
              onClick={setBuyAmountQuarter}
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
              onClick={setBuyAmountHalf}
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
              onClick={setBuyAmountHalfQuarter}
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
              onClick={setBuyAmountMax}
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
                    <TotalInfoTooltipBuy
                      buyPriceNumber={Number(buyPriceNumber)}
                      buyAmountNumber={Number(buyAmountNumber)}
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
          name="buyTotalInput"
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
                if ((!value && !buyPriceNumber) || buyPriceNumber <= 0) {
                  // eslint-disable-next-line no-throw-literal
                  throw 'Please input your correct price'
                } else if (
                  (!value && !buyAmountNumber) ||
                  buyAmountNumber <= 0
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
          <InputNumber precision={8} step={0.1} onChange={onBuyTotalChange} />
        </Form.Item>
        <Form.Item className={styles.formSubmit}>
          {isLogedIn ? (
            <Button
              loading={submitIsLoading}
              className={styles.caltradeSubmitBuy}
              htmlType="submit"
            >
              {intl.formatMessage({
                id: 'exchange.exchange_market.buy',
                defaultMessage: 'Buy',
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
BuyLimitOrder.propTypes = {
  isLogedIn: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired,
  baseAsset: PropTypes.string.isRequired,
  quoteAsset: PropTypes.string.isRequired,
  fees: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  baseAssetPrecision: PropTypes.number.isRequired,
  quoteAssetPrecision: PropTypes.number.isRequired,
}

export default BuyLimitOrder

import React from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import styles from './index.module.scss'

const defaultFee = 0.25
const defaultVat = 0.07
export function TotalInfoTooltipBuy({
  buyPriceNumber,
  buyAmountNumber,
  feePercentage,
  vatPercentage,
}) {
  const fee = new BigNumber(buyPriceNumber)
    .multipliedBy(buyAmountNumber)
    .multipliedBy(feePercentage)
    .toFixed(8)
  const feeMultiplier = fee <= 0 ? 1 : fee
  const vat = new BigNumber(feeMultiplier)
    .multipliedBy(vatPercentage)
    .toFixed(8)
  const total = new BigNumber(fee).plus(vat).toFixed(8)

  return (
    <table>
      <tbody>
        <tr>
          <td className={styles.bold}>Trading Fee({feePercentage}%)</td>
          <td>{!fee || fee === 'NaN' ? (0.0).toPrecision(3) : fee}THB</td>
        </tr>
        <tr>
          <td className={styles.bold}>VAT</td>
          <td>{!vat || vat === 'NaN' ? (0.0).toPrecision(3) : vat} THB</td>
        </tr>
        <tr>
          <td className={styles.bold}>Total</td>
          <td>
            {!total || total === 'NaN' ? (0.0).toPrecision(3) : total} THB
          </td>
        </tr>
      </tbody>
    </table>
  )
}

TotalInfoTooltipBuy.defaultProps = {
  buyPriceNumber: null,
  buyAmountNumber: null,
  feePercentage: defaultFee,
  vatPercentage: defaultVat,
}

TotalInfoTooltipBuy.propTypes = {
  buyPriceNumber: PropTypes.number,
  buyAmountNumber: PropTypes.number,
  feePercentage: PropTypes.number,
  vatPercentage: PropTypes.number,
}

export function TotalInfoTooltipSell({
  sellPriceNumber,
  sellAmountNumber,
  feePercentage,
  vatPercentage,
}) {
  const fee = new BigNumber(sellPriceNumber)
    .multipliedBy(sellAmountNumber)
    .multipliedBy(feePercentage)
    .toFixed(8)
  const feeMultiplier = fee <= 0 ? 1 : fee
  const vat = new BigNumber(feeMultiplier)
    .multipliedBy(vatPercentage)
    .toFixed(8)
  const total = new BigNumber(fee).plus(vat).toFixed(8)
  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className={styles.bold}>Trading Fee({feePercentage}%)</td>
            <td>{!fee || fee === 'NaN' ? (0.0).toPrecision(3) : fee}THB</td>
          </tr>
          <tr>
            <td className={styles.bold}>VAT</td>
            <td>{!vat || vat === 'NaN' ? (0.0).toPrecision(3) : vat} THB</td>
          </tr>
          <tr>
            <td className={styles.bold}>Total</td>
            <td>
              {!total || total === 'NaN' ? (0.0).toPrecision(3) : total} THB
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

TotalInfoTooltipSell.defaultProps = {
  sellPriceNumber: null,
  sellAmountNumber: null,
  feePercentage: defaultFee,
  vatPercentage: defaultVat,
}

TotalInfoTooltipSell.propTypes = {
  sellPriceNumber: PropTypes.number,
  sellAmountNumber: PropTypes.number,
  feePercentage: PropTypes.number,
  vatPercentage: PropTypes.number,
}

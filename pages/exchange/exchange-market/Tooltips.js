import React from 'react'
// import { Button } from 'antd';
import PropTypes from 'prop-types'
import styles from './index.module.scss'

function Tooltips({ fees, userLoggedIn }) {
  const feesTaker = fees.Taker
  const feesMaker = fees.Maker
  const defautlFee = 0.25

  return (
    <div className={styles.tooltips}>
      <div className={styles.container}>
        <div className="row">
          {/* <p>
            Your Level <b>General</b>
            <Button className={styles.link} type="link">
              {'Details >>'}
            </Button>
          </p> */}
        </div>
        <div className={styles.fee}>
          <p className={styles.bold}>Transaction Fee::</p>
          <table>
            <tbody>
              <tr>
                <td className={styles.bold}>Taker</td>
                <td>{userLoggedIn ? feesTaker : defautlFee}%</td>
              </tr>
              <tr>
                <td className={styles.bold}>Maker</td>
                <td>{userLoggedIn ? feesMaker : defautlFee}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

Tooltips.defaultProps = {
  fees: null,
}

Tooltips.propTypes = {
  fees: PropTypes.object,
  userLoggedIn: PropTypes.bool.isRequired,
}

export default Tooltips

import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import styles from './index.module.scss'

function LoginRegisterButton() {
  const intl = useIntl()

  return (
    <div className={cx(styles.loginRegisterButton, 'textMain')}>
      <Link className={styles.loginRegisterLink} to="/login">
        {intl.formatMessage({
          id: 'exchange.exchange_market.login',
          defaultMessage: 'Log In',
        })}
      </Link>
      <span>
        {intl.formatMessage({
          id: 'exchange.exchange_market.or',
          defaultMessage: ' or ',
        })}
      </span>
      <a
        className={styles.loginRegisterLink}
        href="https://satang.pro/signup"
        target="_blank"
        rel="noopener noreferrer"
      >
        {intl.formatMessage({
          id: 'exchange.exchange_market.register',
          defaultMessage: 'Register now',
        })}
      </a>
      <span>
        {intl.formatMessage({
          id: 'exchange.exchange_market.to_trade',
          defaultMessage: ' to trade',
        })}
      </span>
    </div>
  )
}

export default LoginRegisterButton

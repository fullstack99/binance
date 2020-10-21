import React from 'react'
import cx from 'classnames'
import { notification } from 'antd'
import { CheckSquareOutlined } from '@ant-design/icons'
import styles from './index.module.scss'

export function useInfoNotification() {
  const showInfoNotification = ({ message, className }) => {
    notification.info({
      message,
      placement: 'topRight',
      className: cx(styles.notification, className),
      icon: <CheckSquareOutlined />,
    })
  }

  return showInfoNotification
}

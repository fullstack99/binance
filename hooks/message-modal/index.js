import React from 'react'
import cx from 'classnames'
import { useIntl } from 'react-intl'
import { Modal } from 'antd'
import useFormatErrorMessage from 'hooks/format-error-message'
import { ErrorIcon, ConfirmationIcon } from 'asset/icons'
import styles from './index.module.scss'

export function useErrorMessageModal() {
  const intl = useIntl()
  const formatErrorMessage = useFormatErrorMessage()

  const showErrorMessage = ({ error, message, onOk, onCancel }) =>
    Modal.error({
      className: styles.message_modal,
      icon: null,
      okText: intl.formatMessage({ id: 'i_understand' }),
      title: <ErrorIcon />,
      content: error ? formatErrorMessage(error) : message,
      onOk,
      onCancel,
    })

  return showErrorMessage
}

export function useInfoMessageModal() {
  const intl = useIntl()
  const showInfoMessage = ({
    content,
    onOk,
    onCancel,
    className,
    width,
    hideOkButton = true,
  }) =>
    Modal.info({
      className: cx(styles.message_modal, className),
      icon: null,
      okButtonProps: hideOkButton ? { style: { display: 'none' } } : null,
      okText: intl.formatMessage({ id: 'i_understand' }),
      content,
      onOk,
      onCancel,
      width,
    })

  return showInfoMessage
}

export function useConfirmationMessageModal() {
  const intl = useIntl()
  const showConfirmationMessage = ({
    title,
    content,
    okText,
    onOk,
    cancelText,
    onCancel,
    className,
    width,
    ...rest
  }) =>
    Modal.confirm({
      className: cx(styles.message_modal, styles.cofirmation_modal, className),
      icon: null,
      title: title ?? <ConfirmationIcon />,
      content,
      okText: okText ?? intl.formatMessage({ id: 'confirm' }),
      onOk,
      cancelText: cancelText ?? intl.formatMessage({ id: 'cancel' }),
      onCancel,
      width: width ?? 480,
      ...rest,
    })

  return showConfirmationMessage
}

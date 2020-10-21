import { post, get } from './api-creator'

function uploadSlipImage(data) {
  return post('/upload/deposit_slip_image', data, {
    'content-type': 'multipart/form-data',
  })
}

function bankAccountDeposits(data) {
  return post('/bank-account-deposits/', data)
}

function promptpayDeposits(data) {
  return post('/qr-deposits/', data)
}

function promptpayDepositInfo(data) {
  return get('/qr-deposits/', data)
}

const depositFiatApi = {
  uploadSlipImage,
  bankAccountDeposits,
  promptpayDeposits,
  promptpayDepositInfo,
}

export default depositFiatApi

import { post } from './api-creator'

function createCryptoWithdrawal(data) {
  return post('/crypto-withdrawals/', data)
}

const withdrawalApi = { createCryptoWithdrawal }

export default withdrawalApi

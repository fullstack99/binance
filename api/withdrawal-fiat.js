import { post } from './api-creator'

function createFiatWithdrawal(data) {
  return post('/bank-account-withdrawals/', data)
}

const withdrawalFiatApi = { createFiatWithdrawal }

export default withdrawalFiatApi

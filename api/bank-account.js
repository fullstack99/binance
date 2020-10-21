import { get, post, remove } from './api-creator'

function fetchBankAccounts(data) {
  return get('/bank-accounts/', data)
}

function uploadBookBankImage(data) {
  return post('/upload/bank', data, { 'content-type': 'multipart/form-data' })
}

function addBankAccount(data) {
  return post('/bank-accounts/', { ...data, type: 'bankAccount' })
}

function deleteBankAccount({ id }) {
  return remove(`/bank-accounts/${id}`)
}

const bankAccountApi = {
  fetchBankAccounts,
  uploadBookBankImage,
  addBankAccount,
  deleteBankAccount,
}

export default bankAccountApi

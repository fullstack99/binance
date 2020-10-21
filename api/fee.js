import { get } from './api-creator'

function getFee(pair) {
  return get(`/fees/?pair=${pair.toLowerCase()}`)
}

const feesApi = { getFee }

export default feesApi

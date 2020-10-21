import { get } from './api-creator'

function getChallenge() {
  return get('gt/preprocess')
}

const geetestApi = { getChallenge }

export default geetestApi

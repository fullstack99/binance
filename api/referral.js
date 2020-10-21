import { get } from './api-creator'

function fetchReferral() {
  return get(`/users/referral`)
}

const referralApi = {
  fetchReferral,
}

export default referralApi

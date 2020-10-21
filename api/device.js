import { mockGet } from './mock-api/creator'

function fetchDevices(data) {
  return mockGet('/user/devices', data)
}

function fetchSingleDevice(data) {
  return mockGet('/user/device', data)
}

const deviceApi = { fetchDevices, fetchSingleDevice }

export default deviceApi

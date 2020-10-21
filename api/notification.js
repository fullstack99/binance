import { get, put } from './api-creator'
import { mockGet } from './mock-api/creator'

function fetchLatestNotification() {
  return get('/notifications/', { offset: 0, limit: 10 })
}

function fetchNotification(data) {
  if (data.type === 'all' || data.type === 'trade') {
    return get('/notifications/', data)
  }
  return mockGet('/notifications/', data)
}

function updateLastNotificationReadTime() {
  return put('/notifications/', {
    last_notification_read_at: new Date().toISOString(),
  })
}

const notificationApi = {
  fetchLatestNotification,
  fetchNotification,
  updateLastNotificationReadTime,
}

export default notificationApi

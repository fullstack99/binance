import get from 'lodash/get'

export const orders = state => get(state, 'orders', {})

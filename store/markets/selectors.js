import get from 'lodash/get'

export const markets = state => get(state, 'markets', {})

export const parseTypes = {
  depth: 'DEPTH',
  orderbook: 'ORDER_BOOK',
}

export function filterByBorder(source, borderValue, desc, count) {
  const data = []
  let start = 0
  let end = 2

  if (source.length && borderValue) {
    let i = 0
    const innerCount = count || source.length - 1
    let isLessThanZero = true

    for (i; data.length <= innerCount && i <= innerCount; i++) {
      // if (desc ? source[i][0] <= borderValue : source[i][0] >= borderValue)
      const value = source[i][0]
      if (value > 1) {
        isLessThanZero = false
      }
      // get 0 decimal range if all values are less than 0
      if (isLessThanZero) {
        const val = value.toString()
        const group = val.match(/\.(0+)/)
        if (group && (group[1].length + 1 < start || start === 0)) {
          start = group[1].length + 1
        }
        const decimalLength = val.length - val.indexOf('.') - 1
        if (decimalLength > end) {
          end = decimalLength
        }
      }

      data.push({
        value,
        volume: source[i][1],
        sumValue: source[i][0] * source[i][1],
      })
    }
  }

  return {
    data,
    start,
    end,
  }
}

// Parse data from depth data source
export function parseData(bids = [], asks = [], type = parseTypes.depth) {
  const bidDataset = []
  const askDataset = []

  // Function to process (sort and calculate cummulative volume)
  function processData(list, desc) {
    let totalVolume = 0

    // Calculate cummulative volume
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        /* eslint-disable no-param-reassign */
        totalVolume = list[i].volume + totalVolume
      } else {
        /* eslint-disable no-param-reassign */
        totalVolume = list[i].volume
      }

      const operator = desc ? 'unshift' : 'push'
      const dataset = desc ? bidDataset : askDataset

      let item
      if (type === parseTypes.depth) {
        item = {
          x: list[i].value,
          y: totalVolume,
        }
      }
      if (type === parseTypes.orderbook) {
        item = {
          ...list[i],
        }
      }

      dataset[operator](item)
    }
  }

  processData(bids, true)
  processData(asks, false)

  return { bidDataset, askDataset }
}

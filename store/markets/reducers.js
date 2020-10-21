import { createActions, handleActions } from 'redux-actions'
import { uniqBy } from 'lodash'

const options = {
  prefix: 'MARKETS',
}

export const marketsActions = createActions(
  {
    FETCH: undefined,
    SUCCESS: undefined,
    FAILURE: undefined,
    UPDATE: {
      PRICE: undefined,
      FAVORITE: undefined,
    },
  },
  options,
)

export const marketsReducer = handleActions(
  new Map([
    [marketsActions.fetch, state => ({ ...state, loading: true, error: null })],
    [
      marketsActions.success,
      (state, action) => {
        let newData = uniqBy(state.temp.concat(action.payload), v => v.s)

        if (state.data.length) {
          newData = action.payload.map(d => {
            const oldOne = state.data.find(v => d.s === v.s)

            if (oldOne) {
              d.lpStatus = oldOne.lpStatus
              d.favorite = oldOne.favorite
            }
            return d
          })
        }

        return {
          ...state,
          loading: false,
          data: newData,
          temp: [],
        }
      },
    ],
    [
      marketsActions.failure,
      (state, action) => ({ ...state, loading: false, error: action.payload }),
    ],
    [
      marketsActions.update.price,
      (state, action) => {
        if (!state.data.length) {
          return {
            ...state,
            loading: false,
            temp: uniqBy(state.temp.concat(action.payload), v => v.s),
          }
        }

        const symbolMap = {}
        action.payload.forEach(d => {
          symbolMap[d.s] = {
            o: +d.o,
            h: +d.h,
            l: +d.l,
            c: +d.c,
            v: +d.v,
          }
        })

        const updatedData = state.data.map(d => {
          if (symbolMap[d.s]) {
            let lpStatus
            if (d.c < symbolMap[d.s].c) {
              lpStatus = 'UP'
            }
            if (d.c > symbolMap[d.s].c) {
              lpStatus = 'DOWN'
            }

            return {
              ...d,
              ...symbolMap[d.s],
              lpStatus,
            }
          }
          return d
        })

        return {
          ...state,
          loading: false,
          data: updatedData,
        }
      },
    ],
    [
      marketsActions.update.favorite,
      (state, action) => {
        const symbol = action.payload
        const updatedData = state.data.map(d => {
          if (d.s === symbol) {
            return {
              ...d,
              favorite: !d.favorite,
            }
          }
          return d
        })

        return {
          ...state,
          loading: false,
          data: updatedData,
        }
      },
    ],
  ]),
  { data: [], temp: [], loading: false, error: null },
  options,
)

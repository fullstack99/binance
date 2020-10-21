import { createActions, handleActions } from 'redux-actions'

const options = {
  prefix: 'ORDERS',
}

const createOptions = {
  prefix: 'CREATE_ORDERS',
}

export const ordersActions = createActions(
  {
    FETCH: {
      START: undefined,
      SUCCESS: undefined,
      FAILURE: undefined,
    },
    CANCEL: {
      START: undefined,
      SUCCESS: undefined,
      FAILURE: undefined,
    },
  },
  options,
)

export const createOrdersActions = createActions(
  {
    CREATE: {
      START: undefined,
      SUCCESS: undefined,
      FAILURE: undefined,
    },
  },
  createOptions,
)

export const ordersReducer = handleActions(
  new Map([
    [
      ordersActions.fetch.start,
      state => ({ ...state, loading: true, data: {}, error: null }),
    ],
    [
      ordersActions.fetch.success,
      (state, action) => ({
        ...state,
        loading: false,
        data: action.payload,
      }),
    ],
    [
      ordersActions.fetch.failure,
      (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
        data: {},
      }),
    ],
    [
      ordersActions.cancel.start,
      state => ({ ...state, loading: true, error: null }),
    ],
    [
      ordersActions.cancel.success,
      (state, action) => ({
        ...state,
        loading: false,
        data: state.data.filter(d => d.id !== action.payload),
      }),
    ],
    [
      ordersActions.cancel.failure,
      (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
      }),
    ],
  ]),
  { data: {}, loading: false, error: null },
  options,
)

export const createOrdersReducer = handleActions(
  new Map([
    [
      createOrdersActions.create.start,
      state => ({ ...state, loading: true, error: null }),
    ],
    [
      createOrdersActions.create.success,
      state => ({
        ...state,
        loading: false,
      }),
    ],
    [
      createOrdersActions.create.failure,
      (state, action) => ({
        ...state,
        loading: false,
        error: action.payload,
      }),
    ],
  ]),
  { loading: false, error: null },
  createOptions,
)

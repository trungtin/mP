const LOAD = 'my-app/process/LOAD';
const LOAD_SUCCESS = 'my-app/process/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/process/LOAD_FAIL';
const STORE = 'my-app/process/STORE';
const STORE_SUCCESS = 'my-app/process/STORE_SUCCESS';
const STORE_FAIL = 'my-app/process/STORE_FAIL';

const initialState = {
  loaded: false,
  recents: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case STORE:
      return {
        ...state,
        storing: true
      };
    case STORE_SUCCESS:
      return {
        ...state,
        storing: false,
        stored: true
      };
    case STORE_FAIL:
      return {
        ...state,
        storing: false,
        stored: false,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.processM && globalState.processM.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/movie/process')
  };
}

export function store(storeObject) {
  return {
    types: [STORE, STORE_SUCCESS, STORE_FAIL],
    promise: (client) => client.post('/movie/store', {
      data: storeObject
    })
  };
}

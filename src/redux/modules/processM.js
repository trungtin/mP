const LOAD = 'my-app/process/LOAD';
const LOAD_SUCCESS = 'my-app/process/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/process/LOAD_FAIL';

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

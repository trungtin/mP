const LOAD = 'my-app/process/LOAD';
const LOAD_SUCCESS = 'my-app/process/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/process/LOAD_FAIL';
const STORE = 'my-app/process/STORE';
const STORE_SUCCESS = 'my-app/process/STORE_SUCCESS';
const STORE_FAIL = 'my-app/process/STORE_FAIL';
const REFRESH = 'my-app/process/REFRESH';
const GOTO = 'my-app/process/GOTO';
const GOTO_SUCCESS = 'my-app/process/GOTO_SUCCESS';
const TURNBACK = 'my-app/process/TURNBACK';
const UPDATE_META = 'my-app/process/UPDATE_META';
const UPDATE_URL_STATE_SUCCESS = 'my-app/process/UPDATE_URL_STATE_SUCCESS';
const UPDATE_URL_STATE_FAIL = 'my-app/process/UPDATE_URL_STATE_FAIL';
const UPDATE_URL_STATE = 'my-app/process/UPDATE_URL_STATE';
const LOAD_LIST_SUCCESS = 'my-app/process/LOAD_LIST_SUCCESS';
const LOAD_LIST_FAIL = 'my-app/process/LOAD_LIST_FAIL';
const LOAD_SAVED_PAGE = 'my-app/user/LOAD_SAVED_PAGE';
const SAVE_PAGE_SUCCESS = 'my-app/user/SAVE_PAGE_SUCCESS';
const SAVE_PAGE_FAIL = 'my-app/user/SAVE_PAGE_FAIL';

const initialState = {
  loaded: false,
  recents: [],
  data: {
    results: [],
    meta: {}
  }
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
        recents: (state.data && state.data.meta && state.data.results.length > 0) ? state.recents.concat(state.data.meta) : state.recents,
        loading: false,
        loaded: false,
        error: action.error
      };
    case STORE:
      return {
        ...state,
        error: null,
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
    case REFRESH:
      return {
        ...initialState,
        savedPages: state.savedPages || [],
        recents: (state.data && state.data.meta && state.data.results.length > 0) ? state.recents.concat(state.data.meta) : state.recents,
        data: action.result,
        loading: false,
        loaded: true
      };
    case GOTO:
      return {
        ...initialState,
        savedPages: state.savedPages || [],
        recents: (state.data && state.data.meta && state.data.results.length > 0) ? state.recents.concat(state.data.meta) : state.recents,
        cached: state.data,
        displayMode: 'goToDisplay',
        loading: true,
        loaded: false
      };
    case GOTO_SUCCESS:
      return {
        ...state,
        data: action.result,
        loading: false,
        loaded: true
      };
    case TURNBACK:
      return {
        ...state,
        recents: (state.data && state.data.meta && state.data.results.length > 0) ? state.recents.concat(state.data.meta) : state.recents,
        savePageSuccess: false,
        data: state.cached,
        cached: null,
        displayMode: '',
        loading: false,
        loaded: true
      };
    case UPDATE_META:
      let newMeta;
      if (!action.result.isReplace) {
        newMeta = Object.assign({}, (state.data && state.data.meta) || {}, action.result.newMeta);
      } else {
        newMeta = action.result.newMeta;
      }
      return {
        ...state,
        data: Object.assign({}, state.data, {meta: newMeta})
      };
    case UPDATE_URL_STATE:
      return {
        ...state,
        updateUrlStateSuccess: null
      };
    case UPDATE_URL_STATE_SUCCESS:
      newMeta = state.data.meta;
      newMeta.url_state = Number.parseInt(action.result, 10);
      return {
        ...state,
        error: null,
        data: Object.assign({}, state.data, {meta: newMeta}),
        updateUrlStateSuccess: true
      };
    case UPDATE_URL_STATE_FAIL:
      return {
        ...state,
        updateUrlStateSuccess: false,
        error: action.error
      };
    case LOAD_LIST_SUCCESS:
      return {
        ...state,
        movieList: action.result
      };
    case LOAD_LIST_FAIL:
      return {
        ...state,
        movieList: null,
        error: action.error
      };
    case SAVE_PAGE_SUCCESS:
      return {
        ...state,
        savePageSuccess: true,
        savedPages: action.result
      };
    case SAVE_PAGE_FAIL:
      return {
        ...state,
        savePageSuccess: false,
        error: action.error
      };
    case LOAD_SAVED_PAGE:
      return {
        ...state,
        savedPages: action.result
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

export function refresh(queryPath) {
  return {
    types: [LOAD, REFRESH, LOAD_FAIL],
    promise: (client) => client.get('/movie/process/' + (queryPath || ''))
  };
}

export function goTo(userid, albumid) {
  return {
    types: [GOTO, GOTO_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/movie/scrape?userid=' + userid + (albumid ? ('&albumid=' + albumid) : ''))
  };
}

export function turnBack() {
  return {
    type: TURNBACK
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

export function updateMeta(newMeta, isReplace = false) {
  return {
    types: [null, UPDATE_META, null],
    promise: () => Promise.resolve({newMeta, isReplace})
  };
}

export function updateMovieUrlState(id, newState) {
  return {
    types: [UPDATE_URL_STATE, UPDATE_URL_STATE_SUCCESS, UPDATE_URL_STATE_FAIL],
    promise: (client) => client.get('/movie/store/updatestate?id=' + id + '&state=' + newState)
  };
}

export function loadList(state, limit) {
  return {
    types: [null, LOAD_LIST_SUCCESS, LOAD_LIST_FAIL],
    promise: client => client.get('/movie/load/list?' + (state ? `state=${state}` : ``) + (limit ? `limit=${limit}` : ``))
  };
}

export function savePage(url, title) {
  return {
    types: [null, SAVE_PAGE_SUCCESS, SAVE_PAGE_FAIL],
    promise: client => client.post('/user/page/save', {
      data: {
        pageUrl: url,
        title: title || 'Untitled'
      }
    })
  };
}

export function loadSavedPage() {
  return {
    types: [null, LOAD_SAVED_PAGE, null],
    promise: client => client.get('/user/page/load')
  };
}

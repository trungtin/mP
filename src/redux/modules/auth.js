const LOAD = 'my-app/auth/LOAD';
const LOAD_SUCCESS = 'my-app/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/auth/LOAD_FAIL';
const LOGIN = 'my-app/auth/LOGIN';
const LOGIN_SUCCESS = 'my-app/auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'my-app/auth/LOGIN_FAIL';
const LOGOUT = 'my-app/auth/LOGOUT';
const LOGOUT_SUCCESS = 'my-app/auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'my-app/auth/LOGOUT_FAIL';
const REGISTER = 'my-app/auth/REGISTER';
const REGISTER_SUCCESS = 'my-app/auth/REGISTER_SUCCESS';
const REGISTER_FAIL = 'my-app/auth/REGISTER_FAIL';

const initialState = {
  loaded: false
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
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        user: action.result
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        user: null,
        loginError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      };
    case REGISTER:
      return {
        ...state
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        user: action.result.user,
        message: action.result.message
      };
    case REGISTER_FAIL:
      return {
        ...state,
        registerError: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/loadAuth')
  };
}

export function login(authBody) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.post('/login', {
      data: authBody
    })
  };
}

export function register(ob) {
  return {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAIL],
    promise: (client) => client.post('/register', {
      data: ob
    })
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.get('/logout')
  };
}

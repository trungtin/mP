const LOAD = 'my-app/movies/LOAD';
const LOAD_SUCCESS = 'my-app/movies/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/movies/LOAD_FAIL';
const DISPLAY = 'my-app/movies/DISPLAY';
const PLAY = 'my-app/movies/PLAY';
const CLOSE = 'my-app/movies/CLOSE';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      console.log('------------------------loading-----------------------------');
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        displaying: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case DISPLAY:
      if (action.movie.id === state.displaying.id) {
        return {
          ...state,
          displaying: null
        };
      }
      return {
        ...state,
        displaying: action.movie
      };
    case PLAY:
      return {
        ...state,
        playing: action.movie,
        displaying: null
      };
    case CLOSE:
      return {
        ...state,
        displaying: state.playing,
        playing: null
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.movies && globalState.movies.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/movie/load')
  };
}

export function display(movie) {
  return {
    type: DISPLAY,
    movie: movie
  };
}

export function play(movie) {
  return {
    type: PLAY,
    movie: movie
  };
}

export function close() {
  return {
    type: CLOSE
  };
}

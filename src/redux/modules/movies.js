import qs from 'query-string';
import _ from 'lodash';

const LOAD = 'my-app/movies/LOAD';
const LOAD_SUCCESS = 'my-app/movies/LOAD_SUCCESS';
const LOAD_FAIL = 'my-app/movies/LOAD_FAIL';
const DISPLAY = 'my-app/movies/DISPLAY';
const PLAY = 'my-app/movies/PLAY';
const CLOSE = 'my-app/movies/CLOSE';
const GET_MEDIA = 'my-app/movies/GET_MEDIA';
const GET_MEDIA_SUCCESS = 'my-app/movies/GET_MEDIA_SUCCESS';
const GET_MEDIA_FAIL = 'my-app/movies/GET_MEDIA_FAIL';

const initialState = {
  loaded: false,
  data: {}
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      const data = _.merge(state.data, action.result, (a, b) => {
        if (Array.isArray(a)) {
          return a.concat(b);
        }
      });
      return {
        ...state,
        loading: false,
        loaded: true,
        data: data,
        displaying: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case GET_MEDIA:
      return {
        ...state
      };
    case GET_MEDIA_SUCCESS:
      return {
        ...state,
        media: action.result
      };
    case GET_MEDIA_FAIL:
      return {
        ...state,
        error: action.error
      };
    case DISPLAY:
      if (state.displaying && action.movie.id === state.displaying.id) {
        return {
          ...state
        };
      }
      return {
        ...state,
        displaying: action.movie
      };
    case PLAY:
      return {
        ...state,
        playing: action.urls
      };
    case CLOSE:
      return {
        ...state,
        displaying: null,
        playing: null
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.movies && globalState.movies.loaded;
}

export function load(requireObject = {order: '', limit: '', offset: ''}) {
  const {order, limit, offset} = requireObject;
  console.log(require('util').inspect(requireObject));
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/movie/load?' + qs.stringify({order: order || '', limit: limit || '', offset: offset || ''}))
  };
}

export function loadAll() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/movie/load/all')
  };
}

export function display(movie) {
  return {
    type: DISPLAY,
    movie: movie
  };
}

export function getMedia(id) {
  return {
    types: [GET_MEDIA, GET_MEDIA_SUCCESS, GET_MEDIA_FAIL],
    promise: (client) => client.get('/movie/play/' + id)
  };
}

export function play(urls) {
  return {
    type: PLAY,
    urls: urls
  };
}

export function close() {
  return {
    type: CLOSE
  };
}

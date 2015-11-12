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
      let data;
      action.result.orders && action.result.orders.forEach(order => {
        if (!state.data[order] || action.result.offset >= state.data[order].length) {
          data = _.merge(state.data, {[order]: action.result.data[order]}, (a, b) => {
            if (Array.isArray(a)) {
              return a.concat(b);
            }
          });
        }
      });
      return {
        ...state,
        loading: false,
        loaded: true,
        data: data || state.data,
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
        ...state,
        getting: true,
        getted: false
      };
    case GET_MEDIA_SUCCESS:
      return {
        ...state,
        getting: false,
        getted: true,
        media: action.result
      };
    case GET_MEDIA_FAIL:
      return {
        ...state,
        getting: false,
        getted: false,
        error: action.error
      };
    case DISPLAY:
      if (state.displaying && action.movie.id === state.displaying.id) {
        return {
          ...state,
          playUrls: null
        };
      }
      return {
        ...state,
        playUrls: null,
        displaying: action.movie
      };
    case PLAY:
      return {
        ...state,
        playUrls: action.urls,
        displaying: null,
        error: action.error
      };
    case CLOSE:
      return {
        ...state,
        displaying: null,
        playUrls: null
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

export function play(media) {
  let urls;
  let err;
  if (media.permanent_url && media.permanent_url.length !== 0) {
    urls = media.permanent_url;
  } else if (media.temporary_url && media.temporary_url.length !== 0) {
    urls = media.temporary_url;
  } else {
    err = 'NO WORKING URL!';
  }
  return {
    type: PLAY,
    urls: urls || [],
    error: err || ''
  };
}

export function close() {
  return {
    type: CLOSE
  };
}

import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import auth from './auth';
import {reducer as form} from 'redux-form';
import widgets from './widgets';
import movies from './movies';
import processM from './processM';

export default combineReducers({
  router: routerStateReducer,
  auth,
  form,
  widgets,
  movies,
  processM
});

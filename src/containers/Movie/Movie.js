import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as movieActions from 'redux/modules/movies';
import {isLoaded as isMoviesLoaded, load as loadMovies} from 'redux/modules/movies';
import {MovieDisplay, MovieCarousel, MoviePlayer} from 'components';

@connect(
  state => ({
    movies: state.movies.data,
    loading: state.movies.loading,
    displaying: state.movies.displaying,
    playing: state.movies.playing,
    error: state.movies.error
  }),
  dispatch => ({
    ...bindActionCreators(movieActions, dispatch)
  })
)
export default class Movies extends Component {
  static propTypes = {
    movies: PropTypes.array,
    load: PropTypes.func,
    display: PropTypes.func,
    play: PropTypes.func,
    displaying: PropTypes.object,
    playing: PropTypes.object
  }
  static fetchData(getState, dispatch) {
    console.log('movie fetchData is called');
    if (!isMoviesLoaded(getState())) {
      return dispatch(loadMovies());
    }
  }
  render() {
    const {movies, display, displaying, play, playing} = this.props;
    return (
      <div>
        { displaying &&
          <MovieDisplay movie={displaying} play={play} />
        }
        {
          playing &&
          <MoviePlayer movie={playing} />
        }
        <MovieCarousel movies={movies} display={display} />
      </div>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as movieActions from 'redux/modules/movies';
import {isLoaded as isMoviesLoaded, loadAll as loadMovies} from 'redux/modules/movies';
import {MovieDisplay, MovieCarousel, MoviePlayer} from 'components';

@connect(
  state => ({
    movies: state.movies.data,
    loading: state.movies.loading,
    displaying: state.movies.displaying,
    playing: state.movies.playing,
    error: state.movies.error
  }),
  movieActions
)
export default class Movies extends Component {
  static propTypes = {
    movies: PropTypes.object,
    load: PropTypes.func,
    display: PropTypes.func,
    displaying: PropTypes.object,
    playing: PropTypes.object
  }
  static fetchData(getState, dispatch) {
    if (!isMoviesLoaded(getState())) {
      return dispatch(loadMovies());
    }
  }
  render() {
    const {movies, display, displaying, playing, load} = this.props;
    const MultiCarousel = (<div>
        <MovieCarousel movies={movies.popularity} display={display} load={load} orderKey="popularity"/>
        <MovieCarousel movies={movies.vote} display={display} load={load} orderKey="vote"/>
        <MovieCarousel movies={movies.releaseDate} display={display} load={load} orderKey="releaseDate"/>
      </div>
    );
    return (
      <div>
        { displaying &&
          <MovieDisplay movie={displaying}/>
        }
        {
          playing &&
          <MoviePlayer movie={playing} />
        }
        {MultiCarousel}
      </div>
    );
  }
}

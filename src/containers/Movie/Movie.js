import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as movieActions from 'redux/modules/movies';
import {isLoaded as isMoviesLoaded, loadAll as loadMovies} from 'redux/modules/movies';
import {MovieDisplay, MovieCarousel, MoviePlayer, MovieExtendedView} from 'components';

@connect(
  state => ({
    movies: state.movies.data,
    loading: state.movies.loading,
    displaying: state.movies.displaying,
    playUrls: state.movies.playUrls,
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
    playUrls: PropTypes.array,
    play: PropTypes.func
  }
  state = {
    popularityExtended: false,
    voteExtended: false,
    releaseDateExtended: false
  }
  
  moviesPerExtendedView = 24
  static fetchData(getState, dispatch) {
    if (!isMoviesLoaded(getState())) {
      return dispatch(loadMovies());
    }
  }
  handleSwitchView(which) {
    this.setState({[which + 'Extended']: !this.state[which + 'Extended']});
    ((2 * this.moviesPerExtendedView) > this.props.movies[which].length) && 
      this.props.load({order: which, offset: this.props.movies[which].length, limit: 2 * this.moviesPerExtendedView
       - this.props.movies[which].length});
  }

  render() {
    const styles = require('./Movie.scss');
    const {movies, display, displaying, playUrls, load, play} = this.props;
    const MovieList = (<div className={styles.movieList} ref="movieList">
        <div className={styles.categoryName} onClick={(e) => {this.handleSwitchView('popularity'); e.target.classList.toggle(styles.extended);}}>
          <h2 onClick={e => e.target.parentNode.classList.toggle(styles.extended)}>Popularity</h2>
        </div>
        {(!this.state.popularityExtended &&
          <MovieCarousel movies={movies.popularity} display={display} load={load} orderKey="popularity"/>)
          || <MovieExtendedView movies={movies.popularity} display={display} load={load} orderKey="popularity" parentUpdate={::this.forceUpdate}/>
        }
        <div className={styles.categoryName} onClick={(e) => {this.handleSwitchView('vote'); e.target.classList.toggle(styles.extended);}}>
          <h2 onClick={e => e.target.parentNode.classList.toggle(styles.extended)}>Highest vote</h2>
        </div>
        {(!this.state.voteExtended &&
          <MovieCarousel movies={movies.vote} display={display} load={load} orderKey="vote"/>)
          || <MovieExtendedView movies={movies.vote} display={display} load={load} orderKey="vote" parentUpdate={::this.forceUpdate}/>
        }
        <div className={styles.categoryName} onClick={(e) => {this.handleSwitchView('releaseDate'); e.target.classList.toggle(styles.extended);}}>
          <h2 onClick={e => e.target.parentNode.classList.toggle(styles.extended)}>New release</h2>
        </div>
        {(!this.state.releaseDateExtended &&
          <MovieCarousel movies={movies.releaseDate} display={display} load={load} orderKey="releaseDate"/>)
          || <MovieExtendedView movies={movies.releaseDate} display={display} load={load} orderKey="releaseDate" parentUpdate={::this.forceUpdate}/>
        }
      </div>
    );
    return (
      <div className={styles['movie-content']}>
        <div style={{paddingBottom: '3rem'}}>
          { displaying &&
            <MovieDisplay movie={displaying} play={play}/>
          }
          {
            playUrls && <MoviePlayer playUrls={playUrls} />
          }
        </div>
        {MovieList}
      </div>
    );
  }
}

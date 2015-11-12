import React, {Component, PropTypes} from 'react';
import ImgOption from './ImgOption';
import {connect} from 'react-redux';
import {getMedia} from 'redux/modules/movies';
import {Button} from 'react-bootstrap';

@connect(state => ({
  media: state.movies.media,
  getting: state.movies.getting,
  getted: state.movies.getted,
  error: state.movies.error
}), {getMedia})
export default class MovieDisplayer extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    play: PropTypes.func,
    media: PropTypes.object,
    getMedia: PropTypes.func,
    getting: PropTypes.bool,
    getted: PropTypes.bool,
    error: PropTypes.string
  }
  componentDidMount() {
    this.props.getMedia(this.props.movie.id);
  }
  componentDidUpdate(prevProps) {
    if (this.props.movie !== prevProps.movie) {
      this.props.getMedia(this.props.movie.id);
    }
  }
  handleClick() {
    const media = this.props.media;
    this.props.play(media);
  }
  render() {
    const {movie, getting, getted, error} = this.props; // eslint-disable-line no-shadow
    const backdropPath = ImgOption.base_url + ImgOption.backdrop_sizes[3] + movie.backdrop_path;
    const posterPath = ImgOption.base_url + ImgOption.poster_sizes[3] + movie.poster_path;
    const styles = require('./MovieDisplay.scss');
    return (
      <div className={'row ' + styles.display} style={{backgroundImage: ['linear-gradient(to right bottom, rgba(63, 63, 63, 0.8), rgba(255, 255, 255, 0))', 'url(' + backdropPath + ')'], backgroundSize: 'cover'}}>
        <div className={'col-sm-6 col-md-4 ' + styles.poster}>
          <img src={posterPath} alt="Poster" />
        </div>
        <div className="col-sm-6 col-md-8">
          <h1>{movie.title}</h1>
          <br />
          <p>{movie.plot}</p>
          <br />
          <p>{
            getted && <Button bsStyle="primary" onClick={::this.handleClick}>Watch now</Button>
          }
          {
            getting && <Button bsStyle="info" className={require('sass/global-styles.scss').blinking}>Loading...</Button>
          }
          {
            !getting && !getted && <Button bsStyle="danger">{error}</Button>
          }</p>
        </div>
      </div>
    );
  }
}

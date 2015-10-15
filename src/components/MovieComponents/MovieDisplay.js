import React, {Component, PropTypes} from 'react';
import ImgOption from './ImgOption';

export default class MovieDisplayer extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    play: PropTypes.func
  }
  handleClick() {
    this.props.play(this.props.movie);
  }
  render() {
    const {movie} = this.props; // eslint-disable-line no-shadow
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
          <p>
            <button className="btn btn-primary" onClick={::this.handleClick}>Watch now</button>
          </p>
        </div>
      </div>
    );
  }
}

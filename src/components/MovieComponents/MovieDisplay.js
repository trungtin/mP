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
    return (
      <div className="row" style={{background: 'url(' + backdropPath + ')'}}>
        <div className="col-sm-6 col-md-4">
          <img src={posterPath} alt="Poster" />
        </div>
        <div className="col-sm-6 col-md-8">
          <h3>{movie.title}</h3>
          <p>{movie.plot}</p>
          <p>
            <button className="btn btn-primary" onClick={::this.handleClick}>Watch now</button>
          </p>
        </div>
      </div>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import ImgOption from './ImgOption';

export default class MovieBlock extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    display: PropTypes.func.isRequired
  }
  handleClick() {
    this.props.display(this.props.movie);
  }
  render() {
    const {movie} = this.props;
    const styles = require('./MovieBlock.scss');
    const imgSrc = ImgOption.base_url + ImgOption.poster_sizes[2] + movie.poster_path;
    return (
      <div onClick={::this.handleClick}>
        <img src={imgSrc} alt={movie.title + ' poster'} styles="margin: 0 auto;"/>
        <div className={styles.starRatings}>
          <div className={styles.starRatingsTop} style={{width: (movie.t_vote * 10) + '%'}}><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div className={styles.starRatingsBottom}><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        </div>
      </div>
    );
  }
}

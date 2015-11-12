import React, {Component, PropTypes} from 'react';
import ImgOption from './ImgOption';

export default class MovieBlock extends Component {
  static propTypes = {
    movie: PropTypes.object.isRequired,
    display: PropTypes.func.isRequired
  }
  handleClick() {
    this.props.display(this.props.movie);
    this.scrollToTop(1500);
  }

  scrollToTop(scrollDuration) {
    const scrollHeight = window.scrollY,
      scrollStep = Math.PI / ( scrollDuration / 15 ),
      cosParameter = scrollHeight / 2;
    var scrollCount = 0,
      scrollMargin;

    function step() {
      setTimeout(() => {
        if ( window.scrollY !== 0 ) {
          window.requestAnimationFrame(step);  
          scrollCount = scrollCount + 1;  
          scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
          window.scrollTo( 0, ( scrollHeight - scrollMargin ) );
        }
      }, 15 );
    }

    window.requestAnimationFrame(step);  
  }
  render() {
    const {movie} = this.props;
    const styles = require('./MovieBlock.scss');
    const imgSrc = ImgOption.base_url + ImgOption.poster_sizes[2] + movie.poster_path;
    return (
      <div className={styles.movieBlock}>
        <div style={{textAlign: 'center'}} className={styles.moviePoster}>
          <img src={imgSrc} alt={movie.title + ' poster'} style={{margin: '0 auto'}}/>
          <i onClick={::this.handleClick} className={'fa fa-plus-circle fa-4x ' + styles.plusCircle} />
        </div>
        <div className={styles.starRatings}>
          <div className={styles.starRatingsTop} style={{width: (movie.t_vote * 10) + '%'}}><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div className={styles.starRatingsBottom}><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        </div>
      </div>
    );
  }
}

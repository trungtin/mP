import React, {Component, PropTypes} from 'react';
import Slider from 'react-slick';
import MovieBlock from './MovieBlock';

export default class MovieCarousel extends Component {
  static propTypes = {
    movies: PropTypes.array.isRequired,
    display: PropTypes.func,
    load: PropTypes.func,
    orderKey: PropTypes.string
  }
  loadMore(index) {
    if (index > (this.props.movies.length - 10)) {
      this.props.load({order: this.props.orderKey, offset: this.props.movies.length});
    }
  }
  render() {
    const settings = {
      infinite: false,
      speed: 500,
      useCss: true,
      centerMode: false,
      draggable: true,
      arrows: true,
      afterChange: ::this.loadMore,
      slidesToShow: 7,
      responsive: [
        {
          breakpoint: 1280, settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        }, {
          breakpoint: 1650, settings: {
            slidesToShow: 5,
            slidesToScroll: 5
          }
        }, {
          breakpoint: 2000, settings: {
            slidesToShow: 7,
            slidesToScroll: 7
          }
        }
      ]
    };
    const styles = require('./MovieCarousel.scss');
    const {movies, display} = this.props; // eslint-disable-line no-shadow
    const moviesArr = movies.map(function mapping(movie, index) {
      return <div key={index}><MovieBlock movie={movie} key={index} display={display}/><h1>{index}</h1></div>;
    });
    return (
      <Slider {...settings} className={styles.carousel}>
        {moviesArr}
      </Slider>
    );
  }
}

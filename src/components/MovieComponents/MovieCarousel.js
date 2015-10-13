import React, {Component, PropTypes} from 'react';
import Slider from 'react-slick';
import MovieBlock from './MovieBlock';

export default class MovieCarousel extends Component {
  static propTypes = {
    movies: PropTypes.array.isRequired,
    display: PropTypes.func
  }
  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      useCss: true,
      centerMode: false,
      draggable: false,
      arrows: true
    };
    const {movies, display} = this.props; // eslint-disable-line no-shadow
    const moviesArr = movies.map(function mapping(movie, index) {
      return <div key={index}><MovieBlock movie={movie} key={index} display={display} /></div>;
    });
    return (
      <Slider {...settings}>
        {moviesArr}
      </Slider>
    );
  }
}

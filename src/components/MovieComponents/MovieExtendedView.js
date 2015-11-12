import React, {Component, PropTypes} from 'react';
import MovieBlock from './MovieBlock';
import {Pagination} from 'react-bootstrap';

export default class MovieExtendedView extends Component {
  static propTypes = {
    movies: PropTypes.array.isRequired,
    display: PropTypes.func,
    load: PropTypes.func,
    orderKey: PropTypes.string,
    parentUpdate: PropTypes.func
  }
  state = {
    activePage: 1
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.movies !== this.props.movies) {
      this.props.parentUpdate();
    }
  }

  moviesPerExtendedViews = 24

  loadMore(index) {
    if (index > (this.props.movies.length - 10)) {
      this.props.load({order: this.props.orderKey, offset: this.props.movies.length});
    }
  }
  handleSelectPage(evt, selectedEvt) {
    if ((selectedEvt.eventKey + 1) * this.moviesPerExtendedViews > this.props.movies.length) {
      this.props.load({order: this.props.orderKey, offset: this.props.movies.length, limit: this.moviesPerExtendedViews});
    }
    this.setState({activePage: selectedEvt.eventKey});
  }
  render() {
    const {movies, display} = this.props; // eslint-disable-line no-shadow
    const moviesArr = movies.slice((this.state.activePage - 1) * this.moviesPerExtendedViews, this.state.activePage * this.moviesPerExtendedViews)
      .map(function mapping(movie, index) {
        return <div key={index} className="col-sm-6 col-md-4 col-lg-3"><MovieBlock movie={movie} key={index} display={display}/></div>;
      });
    let groupedMoviesArr = [];
    for (let i = 0; i < moviesArr.length; i + 4) {
      groupedMoviesArr.push(<div className="row">{moviesArr.splice(i, i + 4)}</div>);
    }
    return (
      <div className="container-fluid">
        <div /* style={{backgroundImage: 'url(' + require('./bg-ev-2.png') + ')', backgroundSize: 'cover'}} */>
          { groupedMoviesArr }
        </div> 
        <div className="row"><div className="col-sm-4 col-sm-offset-4 col-md-2 col-md-offset-5" style={{textAlign: 'center'}}><Pagination
                prev
                next
                items={100}
                maxButtons={2}
                ellipsis
                activePage={this.state.activePage}
                onSelect={::this.handleSelectPage} /></div>
        </div>
      </div>
    );
  }
}

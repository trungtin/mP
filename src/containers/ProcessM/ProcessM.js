import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as processM from 'redux/modules/processM';
import {isLoaded as isResultsLoaded, load as loadResults} from 'redux/modules/processM';
import {ResultBlock} from 'components';
import _ from 'lodash';

@connect(
  state => ({
    results: state.processM.data,
    recents: state.processM.recents,
    loading: state.processM.loading,
    error: state.processM.error
  }),
  dispatch => ({
    ...bindActionCreators(processM, dispatch)
  })
)
export default class ProcessM extends Component {
  static propTypes = {
    results: PropTypes.array.isRequired,
    recents: PropTypes.array.isRequired,
    load: PropTypes.func
  }
  constructor() {
    super();
    this.storeValues = [];
  }
  static fetchData(getState, dispatch) {
    if (!isResultsLoaded(getState())) {
      return dispatch(loadResults());
    }
  }
  storeValue(value) {
    if (value && Object.keys(value).length !== 0) {
      this.storeValues.push(value);
    } else {
      throw Error('No value to remove from store');
    }
  }
  removeValue(value) {
    if (value && Object.keys(value).length !== 0) {
      _.pull(this.storeValues, value);
    } else {
      throw Error('No value to remove from store');
    }
  }
  nextPage() {
    if (this.storeValues.length !== this.props.results.length) {
      return;
    }
  }
  render() {
    let {results, recents} = this.props;
    results = results.map((result, index) => {
      return (<ResultBlock key={index} result={result} store={::this.storeValue} remove={::this.removeValue}/>);
    });
    recents = recents.map((movie, index) => {
      return <li key={index}>{movie.title}</li>;
    });
    return (
      <div className="container-fluid">
        <div id="resultBox" className="row">
          {results}
        </div>
        <div>
          <div className="dropdown">
            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              Recents
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu">
              <li className="dropdown-header">Recent processed results</li>
              {recents}
            </ul>
          </div>
          <div>
            <button type="button" className="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal">
              Launch demo modal
            </button>
            <div className="modal fade" id="myModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title" id="myModalLabel">Modal title</h4>
                  </div>
                  <div className="modal-body">
                    ...
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as processM from 'redux/modules/processM';
import {isLoaded as isResultsLoaded, load as loadResults} from 'redux/modules/processM';
import {ResultBlock, Modal} from 'components';
import __ from 'lodash';
import {Button} from 'react-bootstrap';

@connect(
  state => ({
    results: state.processM.data.results,
    resultsMeta: state.processM.data.meta,
    recents: state.processM.recents,
    loading: state.processM.loading,
    error: state.processM.error
  }),
  processM
)
export default class ProcessM extends Component {
  static propTypes = {
    results: PropTypes.array.isRequired,
    resultsMeta: PropTypes.object.isRequired,
    recents: PropTypes.array.isRequired,
    load: PropTypes.func,
    store: PropTypes.func
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
    if (value && Object.keys(value).length !== 0 && __.indexOf(this.storeValues, value) === -1) {
      this.storeValues.push(value);
      this.forceUpdate();
    } else {
      throw Error('Error while store value');
    }
  }
  removeValue(value) {
    if (value && Object.keys(value).length !== 0) {
      __.pull(this.storeValues, value);
      this.forceUpdate();
    } else {
      throw Error('Value is blank');
    }
  }
  done() {
    console.log('DONE');
    this.props.store({
      meta: this.props.resultsMeta,
      storeValues: this.storeValues
    });
  }
  render() {
    let {results, recents} = this.props;
    const resultsLength = results.length;
    if (results.length === 0) {
      results = (<div><h3>No result found. Just press <strong>'Done'</strong> to put this in to wait line.</h3></div>);
    } else {
      results = results.map((result, index) => {
        return <ResultBlock key={index} result={result} store={::this.storeValue} remove={::this.removeValue}/>;
      });
      results = __.compact(results);
    }
    recents = recents.map((movie, index) => {
      return <li key={index}>{movie.title}</li>;
    });
    const modalData = {
      buttonText: 'Done',
      modalTitle: 'Are you sure you have checked all result?',
      modalBody: '100% sure',
      modalCloseButton: <Button onClick={this.close}>No</Button>,
      modalFooter: <Button bsStyle="primary" onClick={::this.done}>YES</Button>
    };
    const styles = require('./ProcessM.scss');
    return (
      <div className="container container-fluid">
        <div id="resultBox" className="row" style={{margin: 15}}>
          {results}
        </div>
        <div className={styles.counterBox}>
          <p>{this.storeValues.length + '/' + resultsLength}</p>
        </div>
        <div className="row">
          <div className="dropdown col-sm-6">
            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              Recents
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu">
              <li className="dropdown-header">Recent processed results</li>
              {recents}
            </ul>
          </div>
          <div className="col-sm-6">
            <Modal modalData={modalData}/>
          </div>
        </div>
      </div>
    );
  }
}

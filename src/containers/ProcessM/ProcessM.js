import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as processM from 'redux/modules/processM';
// import {isLoaded as isResultsLoaded, load as loadResults} from 'redux/modules/processM';
import {ResultBlock, Modal, MoviePlayer} from 'components';
import __ from 'lodash';
import {Button, DropdownButton, MenuItem, Input, Col} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Sidebar from './Sidebar';

@connect(
  state => ({
    results: state.processM.data ? state.processM.data.results : [],
    resultsMeta: state.processM.data ? state.processM.data.meta : {},
    cached: state.processM.cached,
    recents: state.processM.recents,
    loading: state.processM.loading,
    loaded: state.processM.loaded,
    storing: state.processM.storing,
    stored: state.processM.stored,
    error: state.processM.error,
    displayMode: state.processM.displayMode,
    updateUrlStateSuccess: state.processM.updateUrlStateSuccess,
    user: state.auth.user
  }),
  processM
)
export default class ProcessM extends Component {
  static propTypes = {
    results: PropTypes.array,
    resultsMeta: PropTypes.object,
    cached: PropTypes.object,
    recents: PropTypes.array,
    storing: PropTypes.bool,
    stored: PropTypes.bool,
    loading: PropTypes.bool,
    loaded: PropTypes.bool,
    load: PropTypes.func,
    store: PropTypes.func,
    refresh: PropTypes.func,
    goTo: PropTypes.func,
    turnBack: PropTypes.func,
    displayMode: PropTypes.string,
    updateMeta: PropTypes.func,
    updateMovieUrlState: PropTypes.func,
    updateUrlStateSuccess: PropTypes.bool,
    user: PropTypes.object
  }
  
  constructor() {
    super();
    this.storeValues = [];
    this.playModalData = {};
    this.state = {
      checkedInput: {
        all: false,
        ultra: false,
        high: true,
        medium: true,
        low: false
      },
      displayMode: '',
      isSearch: false
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.error) {
      console.log('Error in ProcessM: ', nextProps.error);
    }
    if (nextProps.storing === false && nextProps.stored === true) {
      this.props.refresh();
      this.refs.doneModal.close();
      this.forceUpdate();
    }
    if (nextProps.results !== this.props.results) {
      this.storeValues = [];
    }
  }

  // static fetchData(getState, dispatch) {
  //   if (!isResultsLoaded(getState())) {
  //     return dispatch(loadResults());
  //   }
  // }
  
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
    this.props.store({
      meta: this.props.resultsMeta,
      storeValues: this.storeValues
    });
  }
  
  openModal() {
    if (this.storeValues.length === 0) {
      this.refs.errorModal.open();
    } else {
      this.refs.doneModal.open();
    }
  }
  
  openPlayModal(urls) {
    this.playModalData = {
      modalBody: (<div><MoviePlayer playUrls={urls} /><div></div></div>)
    };
    this.forceUpdate();
    this.refs.playModal.open();
  }
  
  toggleSidebar(className) {
    ReactDOM.findDOMNode(this.refs.container).classList.toggle(className);
  }
  
  submitQuery(e) {
    e.preventDefault();
    let {query} = this.refs;
    let {all, ultra, high, medium, low} = this.state.checkedInput;
    const queryPath = '/' + query.getValue() + '/' + (ultra ? '1' : '') + (high ? '2' : '') + (all ? '0' : '') + (medium ? '3' : '') + (low ? '4' : ''); 
    this.props.refresh(queryPath);
  }
  
  checkboxChange(e) {
    let target = e.target.getAttribute('label');
    let newState = this.state.checkedInput;
    newState[target] = !newState[target];
    this.setState({checkedInput: newState});
  }
    
  destroyPlayerBeforeClose() {
    let el = window.document.getElementById('movie-player');
    el.parentNode.removeChild(el);
  }  
  render() {
    let {results, resultsMeta, recents, storing, loading, loaded, updateMeta} = this.props;
    const resultsLength = results.length;
    const updateRight = this.props.user && this.props.user.access_level > 5;

    if (results.length === 0) {
      results = (<h3>No result found.</h3>);
    } else {
      results = results.map((result, index) => {
        return <ResultBlock key={index} result={result} resultsMeta={resultsMeta} store={::this.storeValue} remove={::this.removeValue} openPlayModal={::this.openPlayModal} goTo={this.props.goTo} />;
      });
      results = (<div className={require('./ProcessM.scss').content}>{__.compact(results)}</div>);
    }
    
    recents = recents.map((recent, index) => {
      switch (recent.type) {
        case 'fromQuery':
          return <MenuItem key={index} eventKey={index + 1} onClick={() => {this.props.refresh(recent.url);}}>{'Query: ' + recent.queries}</MenuItem>;
        case 'fromMovie':
          return <MenuItem key={index} eventKey={index + 1} onClick={() => {this.props.refresh(recent.url);}}>{'Movie: ' + recent.title}</MenuItem>;
        case 'fromUser':
          return (<MenuItem key={index} eventKey={index + 1} onClick={() => {this.props.goTo(recent.queryObject.userid, recent.queryObject.albumid);}}>{'User/Album: ' 
          + recent.queryObject.userid + '/' + (recent.queryObject.albumid || 'NA')}</MenuItem>);
        default:
          return null;
      }
    });
    
    let confirmStoreButton;
    const styles = require('./ProcessM.scss');
    if (!storing || storing === false) {
      confirmStoreButton = <Button bsStyle="primary" onClick={::this.done}>YES</Button>;
    } else {
      confirmStoreButton = <Button bsStyle="primary" disabled><p className={require('sass/global-styles.scss').blinking}>Saving<span>.</span><span>.</span><span>.</span></p></Button>;
    }
    
    const modalData = {
      modalTitle: 'Are you sure you have checked all result?',
      modalBody: '100% sure',
      modalCloseButton: <Button bsStyle="danger">No</Button>,
      modalFooter: confirmStoreButton
    };

    let errorModalData = {
      modalTitle: 'You got an error!',
      modalBody: 'Please select at least ONE result!',
      modalCloseButton: <Button bsStyle="danger">OK, let me retry.</Button>
    };
    
    return (
      <div className="container" ref="container">
        <div>
          
          {/* Search input */}
          <form onSubmit={::this.submitQuery}>
            <div className="row">
              <Col sm={10}>
                <Input type="text" placeholder="Search for something ?" ref="query" onKeyUp={(e) => {
                  if (e.target.value !== '') {
                    this.setState({isSearch: true});
                  } else {
                    this.setState({isSearch: false});
                  }}}/>
              </Col>
              <Col sm={1} style={{float: 'right', marginRight: 100 / 12 + '%'}}>
                {(this.state.isSearch || !updateRight) && 
                  <Button bsStyle="info" onClick={::this.submitQuery} ref="loadButton">Search</Button>
                }
                {!this.state.isSearch && updateRight &&
                  <Button bsStyle="info" onClick={() => {this.props.refresh();}} ref="loadButton">Just Load</Button>
                }
              </Col>
            </div>
            <div className={'row ' + styles.qualitySelector}>
              {Object.keys(this.state.checkedInput).map(i => 
                <Input type="checkbox" label={i} checked={this.state.checkedInput[i]} onChange={::this.checkboxChange} />
              )}
            </div>
          </form>
          <br/>
          {loading === false && loaded === false &&
            <div><strong>No results or internal error!</strong></div>
          }
          
          {/* Main content */}
          { !loading &&
          <div>
            {/* Back button */}
            {this.props.displayMode === 'goToDisplay' && ((this.props.cached || {}).results || []).length > 0 &&
              <i className="fa fa-arrow-left fa-4x" onClick={::this.props.turnBack} style={{cursor: 'pointer', color: '#455a64'}}/>
            }

            {/* Result block */}
            { loaded && results}

            <br/>
            {/* Recent dropdown and done button */}
            {this.props.displayMode !== 'goToDisplay' &&
              <div className="row">
                { recents.length > 0 &&
                  <DropdownButton bsStyle="default" title="Recents" id="recents-dropdown">
                    {recents}
                  </DropdownButton>
                }
                { loaded && updateRight && 
                  <div style={{float: 'right', marginLeft: '10vw'}}>
                    <Button bsStyle="primary" bsSize="large" onClick={::this.openModal}>
                      DONE
                    </Button>
                  </div>
                }
              </div>
            }
            
            {/* All modal */}
            <Modal ref="doneModal" modalData={modalData} bsSize="xsmall"/>
            <Modal ref="errorModal" modalData={errorModalData} bsSize="xsmall"/>
            <Modal ref="playModal" modalData={this.playModalData} className={styles.playModal} bsSize="large" dialogClassName={styles.playModal} beforeClose={::this.destroyPlayerBeforeClose}/>
          </div>
          }
        </div>
        
        {/* Loading animation */}
        { loading &&
          <div className={require('sass/whirly.scss')['whirly-loader']} />
        }
        <Sidebar length={this.storeValues.length} resultsLength={resultsLength} resultsMeta={resultsMeta} updateMeta={updateMeta} toggleSidebar={::this.toggleSidebar}
          updateMovieUrlState={this.props.updateMovieUrlState} updateUrlStateSuccess={this.props.updateUrlStateSuccess}/>
      </div>
    );
  }
}

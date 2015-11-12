import React, {Component, PropTypes} from 'react';
import ApiClient from 'helpers/ApiClient';
import {Input, Button} from 'react-bootstrap';
import styles from './Sidebar.scss';
import {loadList, refresh, goTo, savePage, loadSavedPage} from 'redux/modules/processM';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';

let api = new ApiClient();

@connect(
  state => ({
    movieList: state.processM.movieList,
    error: state.processM.error,
    user: state.auth.user,
    savedPages: state.processM.savedPages,
    savePageSuccess: state.processM.savePageSuccess
  }),
  dispatch => bindActionCreators({loadList, refresh, goTo, savePage, loadSavedPage}, dispatch)
)
export default class Sidebar extends Component {
  static propTypes = {
    length: PropTypes.number,
    resultsLength: PropTypes.number,
    resultsMeta: PropTypes.object,
    updateMeta: PropTypes.func,
    children: PropTypes.any,
    toggleSidebar: PropTypes.func,
    updateMovieUrlState: PropTypes.func,
    updateUrlStateSuccess: PropTypes.bool,
    loadList: PropTypes.func,
    movieList: PropTypes.array,
    error: PropTypes.object,
    refresh: PropTypes.func,
    goTo: PropTypes.func,
    user: PropTypes.object,
    savedPages: PropTypes.array,
    savePage: PropTypes.func,
    savePageSuccess: PropTypes.bool,
    loadSavedPage: PropTypes.func
  }
  
  constructor() {
    super();
    this.state = {
      showMetaSelectList: false,
      showEditMeta: false,
      showGoToButton: false,
      savingPage: false,
      pageSaved: false,
      updateRight: false
    };
    this.mappedResults = <div></div>;
    this.mappedMovieList = [];
  }

  componentDidMount() {
    // load movie with url_state in (0, 2, 3)
    this.props.loadList();

    if (this.props.user) {
      this.props.loadSavedPage();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.updateUrlStateSuccess !== null) {
      this.setState({isUrlStateUpdating: false});
    }
    if (nextProps.savePageSuccess) {
      this.setState({savingPage: false, pageSaved: true});
      ReactDOM.findDOMNode(this.refs.savePageButton).disabled = true;
    }
    if (nextProps.movieList && nextProps.movieList !== this.props.movieList) {
      this.mappedMovieList = nextProps.movieList.reduce((prev, cur) => {
        prev[cur.url_state || 0].push(<li className={styles.movieListItem}><strong onClick={() => {
          this.handleEditMeta(cur);
          this.openMenu(this.refs.configuration);
        }}>{cur.title}</strong> ({cur.release_date.match(/\d{4}/i)})<span onClick={() => {
          this.handleEditMeta(cur);
          this.openMenu(this.refs.configuration);
        }}>U</span><span onClick={() => {
          this.props.refresh(`/${cur.id}/23`);
        }}>S</span></li>);
        return prev;
      }, [[], [], [], []]);
    }
    if (!this.state.updateRight && nextProps.user && nextProps.user.access_level > 5) {
      this.setState({updateRight: true});
    } else if (this.state.updateRight && (!nextProps.user || nextProps.user.access_level < 5)) {
      this.setState({updateRight: false});
    }
  }
  
  handleEditMeta(result) {
    this.props.updateMeta(result);
    this.setState({showEditMeta: false});
  }
  
  handleSearchMovie(e) {
    if (e.key === 'Enter') {
      e.target.disabled = true;
      let searchFor = this.refs.addMetaInput.getValue();
      api.get('/movie/load/' + searchFor).then(results => {
        e.target.disabled = false;
        if (results && results.length > 0) {
          this.mappedResults = results.map((result, index) =>
            (<li key={index}><a href="#" onClick={() => this.handleEditMeta(result)}><strong>{result.title}</strong> {result.release_date.match(/\d{4}/i)}</a></li>)
          , this);
        } else {
          this.mappedResults = (<li onClick={() => {this.setState({showEditMeta: false});}}><strong>No result</strong></li>);
        }
        this.setState({showMetaSelectList: true});
      });
    }
  }

  handleSavePage(e) {
    e.stopPropagation();
    e.target.disabled = true;
    this.setState({savingPage: false});
    let savedUrl;
    switch (this.props.resultsMeta && this.props.resultsMeta.type) {
      case 'fromQuery':
      case 'fromMovie':
        savedUrl = this.props.resultsMeta.url;
        break;
      case 'fromUser':
        let {userid, albumid} = this.props.resultsMeta.queryObject;
        savedUrl = 'goto?userid=' + userid + (albumid ? '&albumid=' + albumid : '');
        break;
      default:
        break;
    }
    savedUrl && this.props.savePage(savedUrl, e.target.value);
  }
  
  openMenu(e) {
    let menu;
    if (e.target) {
      menu = e.target.nodeName.toLowerCase() === 'div' ? e.target.parentNode : e.target.parentNode.parentNode;
    } else {
      menu = e;
    }
    let allMenuOpen = window.document.getElementsByClassName(styles.menuOpen);
    for (let p of allMenuOpen) {
      if (p !== menu) {
        p.classList.remove(styles.menuOpen);
      }
    }
    menu.classList.toggle(styles.menuOpen);
  }

  render() {
    const {user, resultsMeta, length, resultsLength, toggleSidebar, savedPages} = this.props;

    return (
      <div>
        <div className={styles.sidebar}>
          <div className={styles.content}>
            <ul>
              <li className={styles.menu} ref="configuration">
                <div className={styles.menuTitle} onClick={::this.openMenu}>
                  <h3>Configuration</h3>
                </div>
                <div className={styles.menuItemList}>
                  {(!resultsMeta.id || this.state.showEditMeta) &&
                    <div ref="addMetaBox">
                      <div className="row">
                        <div className="col-sm-10 col-sm-offset-1">
                          <Input type="text" placeholder="Update Information: Search title here." onKeyDown={::this.handleSearchMovie} ref="addMetaInput"/>
                        </div>
                      </div>                
                      {this.state.showMetaSelectList === true &&
                        <div className={styles.resultList + ' row'}>
                          <ul className="col-sm-10 col-sm-offset-1">
                            {this.mappedResults}
                          </ul>
                        </div>
                      }
                    </div>
                  }
                  {resultsMeta.id && !this.state.showEditMeta &&
                    <div className={styles.metaDisplay}>
                      <h3 style={{display: 'inline-block', marginRight: 5}}>{resultsMeta.title + '(' + resultsMeta.release_date.match(/\d{4}/i) + ')'}</h3>
                      <a onClick={(e) => {e.preventDefault(); this.setState({showEditMeta: true}); }} href="#"><i className="fa fa-pencil"></i></a>
                      <a onClick={(e) => {e.preventDefault(); this.props.refresh(`/${resultsMeta.id}/23`); }} href="#"
                        style={{float: 'right', color: 'white', paddingTop: '2rem' }}
                      ><i className="fa fa-search fa-2x"></i></a>
                      { this.state.updateRight && 
                        <div><span>Update state: </span>
                          <div className={styles.selectState}>
                            <a onClick={(e) => {e.preventDefault();}} href="#">
                              { this.state.isUrlStateUpdating ? 'Setting new state...' :
                                ['No url', 'Working', 'Bad quality', 'Not Release'][resultsMeta.url_state || -1] || 'No State' + (this.props.updateUrlStateSuccess === false ? ' (Updated failed)' : '')
                              }
                            </a>
                            <ul className={styles.selectStateBox}>
                              {['No url', 'Working', 'Bad quality', 'Not Release'].map((el, index) => 
                                (<li data-selected={index === resultsMeta.url_state} onClick={
                                  e => {
                                    e.preventDefault();
                                    this.props.updateMovieUrlState(resultsMeta.id, index);
                                    this.setState({isUrlStateUpdating: true});
                                  }
                                }>{el}</li>), this)}
                            </ul>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </li>
              <li className={styles.menu}>
                <div className={styles.menuTitle} onClick={::this.openMenu}>
                  <h3>Other movie</h3>
                </div>
                <ul className={styles.menuItemList}>
                  <li className={styles.menuItem}>
                    <h4>Not working</h4>
                    <ul>
                      {this.mappedMovieList[0]}
                    </ul>
                  </li>
                  <li className={styles.menuItem}>
                    <h4>Good</h4>
                    <ul>
                      {this.mappedMovieList[1]}
                    </ul>
                  </li>
                  <li className={styles.menuItem}>
                    <h4>Bad</h4> 
                    <ul>
                      {this.mappedMovieList[2]}
                    </ul>
                  </li>
                  <li className={styles.menuItem}>
                    <h4>Not release</h4>
                    <ul>
                      {this.mappedMovieList[3]}
                    </ul>
                  </li>
                </ul>
              </li>
              <li className={styles.menu}>
                <div className={styles.menuTitle} onClick={::this.openMenu}>
                  <h3>Go to</h3></div>
                <ul className={styles.menuItemList + ' ' + styles.menuItemListPadding}>
                  <li className={styles.menuItem} onKeyUp={e => this.setState({showGoToButton: !!e.target.value})}>
                    <Input type="text" placeholder="User ID? (required)" required ref="userID"/>
                  </li>
                  <li className={styles.menuItem}>
                    <Input type="text" placeholder="Album ID?" ref="albumID"/>
                  </li>
                  {this.state.showGoToButton &&
                    <li className={styles.menuItem}>
                      <Button bsStyle="info" onClick={() => 
                        this.props.goTo(this.refs.userID.getValue(), this.refs.albumID.getValue() || undefined)}>GO</Button>
                    </li>
                  }
                </ul>
              </li>
              <li className={styles.menu + ' ' + styles.savedPageMenu} ref="savedPageMenu">
                <div className={styles.menuTitle} onClick={::this.openMenu}>
                  <h3>Saved page</h3>
                  { user && !this.state.savingPage &&
                    <Button onClick={ (e) => {
                      e.stopPropagation();
                      if (this.refs.savedPageMenu.className.indexOf(styles.menuOpen) === -1) {
                        this.openMenu(this.refs.savedPageMenu);
                      }
                      this.setState({savingPage: true});
                      let timeoutId = window.setTimeout(() => {
                        window.clearTimeout(timeoutId);
                        let input = this.refs.savePageTitle.refs.input;
                        switch (resultsMeta.type) {
                          case 'fromQuery':
                            input.value = `Query ${resultsMeta.queries}`;
                            break;
                          case 'fromMovie':
                            input.value = `Movie ${resultsMeta.title}`;
                            break;
                          case 'fromUser':
                            input.value = 'User: ' + resultsMeta.queryObject.userid + (resultsMeta.queryObject.albumid ? ', Album: ' + resultsMeta.queryObject.albumid : ''); 
                            break;
                          default:
                            input.value = '';
                        }
                        input.focus();
                      }, 0);
                    }} bsStyle="success" className={styles.savePageButton} ref="savePageButton"><h4>{
                      (!this.state.pageSaved &&
                      'Save this page') || 'Saved'}</h4></Button>
                  }
                  { user && this.state.savingPage &&
                    <Button onClick={e => {
                      e.stopPropagation();
                      this.setState({savingPage: false});
                    }} bsStyle="danger" className={styles.savePageButton}><h4>Cancel</h4></Button>
                  }
                </div>
                { !user && 
                  <h4 onClick={e => e.stopPropagation} className={styles.loginRequired}><a href="/login"><strong>Login required</strong></a></h4>
                }
                <ul className={styles.menuItemList}>
                  { user && this.state.savingPage &&
                    <Input type="text" placeholder="Choose a title" onKeyDown={e => {
                      if (e.key === 'Enter') {
                        this.handleSavePage(e);
                      }
                    }} ref="savePageTitle" />
                  }
                  {savedPages && savedPages.map(p => 
                    <li className={styles.movieListItem} style={{cursor: 'pointer'}}
                      onClick={ () => {
                        if (p.page_url.match(/^goto\?/i)) {
                          let userid = p.page_url.match(/userid=([a-zA-Z0-9]*)/i);
                          let albumid = p.page_url.match(/albumid=([a-zA-Z0-9]*)/i);
                          this.props.goTo(userid[1], albumid && albumid[1]);
                        } else {
                          this.props.refresh(p.page_url);
                        }
                      }}
                    ><strong>{p.title}</strong></li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
          <Button ref="counterButton" bsStyle="info" className={styles.counterButton}
          onClick={() => {toggleSidebar(styles.sidebarOpen);}}>{length + '/' + resultsLength}</Button>
        </div>
        <div className={styles.sidebarPusher} onClick={() => {toggleSidebar(styles.sidebarOpen);}}></div>
      </div>
    );
  }
}

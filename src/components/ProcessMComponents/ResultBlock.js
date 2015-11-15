import React, {Component, PropTypes} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import ApiClient from 'helpers/ApiClient';
import {Input, Alert} from 'react-bootstrap';

let api = new ApiClient();

export default class ResultBlock extends Component {
  static propTypes = {
    result: PropTypes.object.isRequired,
    store: PropTypes.func,
    remove: PropTypes.func,
    openPlayModal: PropTypes.func,
    goTo: PropTypes.func,
    resultsMeta: PropTypes.object
  }
  constructor() {
    super();
    this.checkedClassName = '';
    this.storeValue = {};
    this.stored = false;
    this.urls = [];
    this.searchResults = [];
  }
  state = {
    showAlert: false
  }
  componentDidMount() {
    this.updateStoreValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.result && nextProps.result !== this.props.result) {
      this.updateStoreValue(nextProps);
    }
  }

  updateStoreValue(props) {
    const {result} = props;
    let permanentUrl = result.media$group.media$content.map((content) => {
      if (content.medium === 'video' && content.url.match(/\/redirector.google/i) === null) {
        return content.url;
      }
      return null;
    });
    permanentUrl = permanentUrl.filter((ob) => {if (ob) {return ob;}});
    this.storeValue = {
      user_id: result.id.$t.match(/user\/([a-zA-Z0-9]+)/i)[1],
      album_id: result.id.$t.match(/albumid\/([a-zA-Z0-9]+)/i)[1],
      video_id: result.id.$t.match(/photoid\/([a-zA-Z0-9]+)/i)[1],
      quality: result.media$group.media$content[result.media$group.media$content.length - 1].height
    };
    if (permanentUrl.length > 0) {this.storeValue.permanent_url = permanentUrl;}
  }

  handleStore(forceStore) {
    if (!(this.props.resultsMeta && this.props.resultsMeta.id) && !(this.storeValue.meta && this.storeValue.meta.id)) {
      this.setState({showAlert: true});
      return;
    }
    if (!this.stored) {
      this.stored = true;
      this.props.store(this.storeValue);
    } else if (!forceStore) {
      this.stored = false;
      this.props.remove(this.storeValue);
    }    
  }
  handlePlay(event) {
    event.stopPropagation();
    if (this.urls.length === 0) {
      this.props.result.media$group.media$content.forEach(content => {
        if (content.medium === 'video') {
          this.urls.push(content.url);
        }
      });
    }
    this.props.openPlayModal(this.urls);
  }
  goToUser(e) {
    e.preventDefault();
    this.props.goTo(this.storeValue.user_id);
  }
  goToAlbum(e) {
    e.preventDefault();
    this.props.goTo(this.storeValue.user_id, this.storeValue.album_id);
  }
  handleSearchMovie(e) {
    if (e.key === 'Enter') {
      e.target.setAttribute('disable', 'disable');
      let searchFor = e.target.value;
      api.get('/movie/load/' + searchFor).then(results => {
        e.target.removeAttribute('disable');
        if (results && results.length > 0) {
          this.searchResults = results.map((result, index) =>
            (<li key={index} onClick={ev => {
              ev.stopPropagation();
              this.storeValue.meta = {id: result.id};
              this.refs.addMetaMenu.click(); 
              this.handleStore(true);
            }}><strong>{result.title}</strong> {result.release_date.match(/\d{4}/i)}</li>)
          , this);
        } else {
          this.searchResults = (<li><strong>No result</strong></li>);
        }
        this.forceUpdate();
      });
    }
  }
  render() {
    const {result} = this.props;
    const styles = require('./ResultBlock.scss');
    return (
      <div ref="resultBlock" className={styles.resultBlock + ' ' + (this.stored ? styles.stored : '')}>
        <div>
          <img onClick={::this.handlePlay} src={result.media$group.media$thumbnail[result.media$group.media$thumbnail.length - 1].url} style={{margin: '0 auto'}}/>
        </div>
        <div style={{position: 'relative', cursor: 'crosshair'}}>
          <div onClick={() => this.handleStore()}>
            <span>{'Quality: ' + result.media$group.media$content[result.media$group.media$content.length - 1].height}</span>
            <div className={styles.checkMark}><i className="fa fa-check-circle fa-2x"></i></div>
            <OverlayTrigger
              overlay={<Tooltip style={{wordWrap: 'break-word'}}>{result.title.$t}</Tooltip>} placement="bottom"
              delayShow={300} delayHide={150}
            >
              <p><strong>{result.media$group.media$title.$t}</strong></p>
            </OverlayTrigger>
          </div>
          {this.state.showAlert && 
            <Alert bsStyle="danger" onDismiss={() => this.setState({showAlert: false})} dismissAfter={3000}>
              <h4>No main or instance meta has been selected, please select either.</h4>
            </Alert>
          }
          <div className={styles.ownerLink}>
            {result.gphoto$albumtitle &&
              <a href="#" onClick={::this.goToAlbum}>{result.gphoto$albumtitle.$t + ' - ' + result.id.$t.match(/albumid\/([a-zA-Z0-9]+)/i)[1]}</a>
            }
            {result.author &&
              <a href="#" onClick={::this.goToUser}>{result.author[0].name && result.author[0].name.$t + ' - ' + result.id.$t.match(/user\/([a-zA-Z0-9]+)/i)[1]}</a>
            }
          </div>
          <div className={styles.subMenuContainer}>
            <i className="fa fa-caret-down fa-2x" onClick={e => {
              e.stopPropagation();
              let other = window.document.getElementsByClassName(styles.subMenuOpen)[0];
              other && other !== e.target.parentNode && other.classList.remove(styles.subMenuOpen);
              e.target.parentNode.classList.toggle(styles.subMenuOpen);
            }}></i>
            <ul className={styles.subMenu}>
              <li onClick={e => {
                this.storeValue.original_audio = (this.storeValue.original_audio !== undefined) ? !this.storeValue.original_audio : false;
                let node = e.target.nodeName.toLowerCase() === 'span' ? e.target.parentNode : e.target;
                node.className = this.storeValue.original_audio ? '' : styles.checkedSubMenu;
                this.handleStore(true);
              }}><span>Tagged as foreign dubbed.</span></li>
              <li onClick={e => {
                this.storeValue.foreign_hardcoded_caption = (this.storeValue.foreign_hardcoded_caption !== undefined) ? !this.storeValue.foreign_hardcoded_caption : true;
                let node = e.target.nodeName.toLowerCase() === 'span' ? e.target.parentNode : e.target;
                node.className = this.storeValue.foreign_hardcoded_caption ? styles.checkedSubMenu : '';
                this.handleStore(true);
              }}><span>Tagged as hardcode caption.</span></li>
              <li onClick={e => e.target.lastChild.classList.toggle(styles.menuHidden)} ref="addMetaMenu"><span onClick={ e => {e.stopPropagation(); e.target.parentNode.click();}}>Specific meta info for this.</span>
                <div className={styles.addMetaMenu + ' ' + styles.menuHidden} onClick={e => e.stopPropagation()}>
                  <Input type="text" placeholder="Search for title." onKeyDown={::this.handleSearchMovie} ref="addMetaInput"/>
                  <ul>{this.searchResults}</ul>
                </div>
              </li>
              <li><span>...</span></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

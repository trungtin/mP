import React, {Component, PropTypes} from 'react';

export default class ResultBlock extends Component {
  static propTypes = {
    result: PropTypes.object.isRequired,
    store: PropTypes.func,
    remove: PropTypes.func
  }
  constructor() {
    super();
    this.checkedClassName = '';
    this.storeValue = {};
  }
  componentDidMount() {
    const {result} = this.props;
    let permanentUrl = result.media$group.media$content.map((content) => {
      if (content.medium === 'video' && content.url.match(/\/redirector.google/i) === null) {
        return content.url;
      }
      return null;
    });
    permanentUrl = permanentUrl.filter((ob) => {if (ob) {return ob;}});
    this.storeValue = {
      user_id: result.id.$t.match(/user\/([0-9]+)/i)[1],
      album_id: result.id.$t.match(/albumid\/([0-9]+)/i)[1],
      video_id: result.id.$t.match(/photoid\/([0-9]+)/i)[1],
      quality: result.media$group.media$content[result.media$group.media$content.length - 1].height
    };
    if (permanentUrl.length > 0) {this.storeValue.permannent_url = permanentUrl;}
  }
  handleStore() {
    this.checkedClassName = 'stored';
    console.log(require('util').inspect(this.storeValue));
    this.props.store(this.storeValue);
  }
  handleRemove() {
    this.checkedClassName = 'removed';
    console.log(require('util').inspect(this.storeValue));
    this.props.remove(this.storeValue);
  }
  render() {
    const {result} = this.props;
    return (
      <div className={'col-md-6' + this.checkedClassName}>
        <div>
          <img src={result.media$group.media$thumbnail[result.media$group.media$thumbnail.length - 1].url} styles="margin: 0 auto;"/>
        </div>
        <div>
          <span>Quality: {result.media$group.media$content[result.media$group.media$content.length - 1].height}</span>
        </div>
        <div>
          <p>{result.title.$t}</p>
          <p>{result.media$group.media$title.$t}</p>
        </div>
        <div className="row">
          <button type="button" className="btn btn-default btn-md" onClick={::this.handleStore}>
            <i className="fa fa-check"></i>
          </button>
          <button type="button" className="btn btn-default btn-md" onClick={::this.handleRemove}>
            <i className="fa fa-times"></i>
          </button>
        </div>
      </div>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';
import DocumentMeta from 'react-document-meta';
const cdn = '//cdnjs.cloudflare.com/ajax/libs/';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  }

  render() {
    const {assets, component, store} = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';

    return (
      <html lang="en-us">
        <head>
          <meta charSet="utf-8"/>
          {DocumentMeta.renderAsReact()}

          <link rel="shortcut icon" href="/favicon.png" />
          <link href={cdn + 'twitter-bootstrap/3.3.5/css/bootstrap.css'}
                media="screen, projection" rel="stylesheet" type="text/css" />
          <link href={cdn + 'font-awesome/4.3.0/css/font-awesome.min.css'}
                media="screen, projection" rel="stylesheet" type="text/css" />
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.3.15/slick.css" />
          <link rel="stylesheet" type="text/css" href="http://vjs.zencdn.net/5.0.0/video-js.css" />
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css"/>
          )}
        </head>
        <body>
          <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} />
          <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
          <script src={assets.javascript.main}/>
          <script src={cdn + 'react/0.14.0/react.min.js'}/>
          <script src={cdn + 'react/0.14.0/react-dom.min.js'}/>
          <script src={cdn + 'react-bootstrap/0.27.1/react-bootstrap.min.js'}/>
          <script src="//vjs.zencdn.net/5.0.0/video.js"></script>
          <script src="/videojs-resolution-switcher.js" />
          <link rel="stylesheet" href="/videojs-resolution-switcher.css" />
        </body>
      </html>
    );
  }
}

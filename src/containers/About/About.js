import React, {Component} from 'react';
import DocumentMeta from 'react-document-meta';

export default class About extends Component {
  render() {
    return (
      <div className="container">
        <h1>About Us</h1>
        <DocumentMeta title="Movie-Project: About Us"/>

        <p>This project was a result of my attempt learning React. It doesn't have the potential of, and never be, a commercial product.
          So feel free to use it, and in case any problem arise, you can contact <a href="https://twitter.com/nitgnurtnart" target="_blank">me here.</a>
          <br/>Also a big thank to <a href="https://twitter.com/erikras" target="_blank">@erikas</a> and all contributors of this <a href="https://github.com/erikras/react-redux-universal-hot-example"
          target="_blank">awesome project</a>, I've learned alot about React from it.
        </p>
        <br/>

        <h3>Disclaimer</h3>
        <p>We make no warranty with respect to documents or other information available from this Website;
         assumes no legal liability or responsibility whatsoever for the accuracy, completeness, or usefulness of any such information;
         and does not represent that its use would not infringe privately owned rights.
        <br/>We disclaim all warranties, express and implied, including the warranties of merchantability and fitness for a particular purpose.
        </p>
        <p><strong>TL;DR: </strong> All data on this site is from Google or TheMovieDatabase. No copyright infringement intended.</p>
      </div>
    );
  }
}

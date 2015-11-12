import React, { Component } from 'react';

export default class Home extends Component {
  render() {
    const styles = require('./Home.scss');
    // require the logo image both from client and server
    const logoImage = require('./logo.png');
    return (
      <div className={styles.home}>
        <div className={styles.masthead}>
          <div className="container">
            <div className={styles.logo}>
              <p>
                <img src={logoImage}/>
              </p>
            </div>
            <h1>mP</h1>

            <h2>Be with us, all the movie-lover!</h2>
          </div>
        </div>

        <div className="container">
          
        </div>
      </div>
    );
  }
}

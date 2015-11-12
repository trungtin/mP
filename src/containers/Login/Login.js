import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import DocumentMeta from 'react-document-meta';
import * as authActions from 'redux/modules/auth';
import {isLoaded as isAuthLoaded, load as loadAuth} from 'redux/modules/auth';
import {Alert} from 'react-bootstrap';

@connect(
  state => ({
    user: state.auth.user,
    loginError: state.auth.loginError
  }),
  authActions)
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    loginError: PropTypes.string
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.loginError) {
      this.refs.password.value = '';
    } 
  }
  static fetchData(getState, dispatch) {
    if (!isAuthLoaded(getState())) {
      return dispatch(loadAuth());
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const input = {username: this.refs.username.value, password: this.refs.password.value};
    this.props.login(input);
    input.value = '';
  }

  render() {
    const {user, logout, loginError} = this.props;
    const styles = require('./Login.scss');
    return (
      <div className={styles.loginPage + ' container'}>
        <DocumentMeta title="React Redux Example: Login"/>
        <h1>Login</h1>
        {!user &&
        <div>
          <form className="login-form" onSubmit={::this.handleSubmit}>
            <div>
              <input type="text" ref="username" placeholder="Enter a username"/>
            </div>
            <div>
              <input type="password" ref="password" placeholder="and password"/>
            </div>
            <button className="btn btn-success" onClick={::this.handleSubmit}><i className="fa fa-sign-in"/>{' '}Log In
            </button>
          </form>
          {loginError &&
            <Alert bsStyle="danger" dismissAfter={5000}>
              <h4>Oh snap! Login error!</h4>
              <p>{loginError}</p>
            </Alert>
          }
        </div>
        }
        {user &&
        <div>
          <p>You are currently logged in as {user.username}.</p>

          <div>
            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
      </div>
    );
  }
}

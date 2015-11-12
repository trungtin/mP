import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as authActions from 'redux/modules/auth';
import {isLoaded as isAuthLoaded, load as loadAuth} from 'redux/modules/auth';
import Rx from 'rx';
import {Tooltip} from 'react-bootstrap';
import ApiClient from 'helpers/ApiClient';

let api = new ApiClient();

function isUsernameAvailable(username) {
  return api.get('/register/checkUsernameAvaibility', {params: {query: username}});
}

function isEmailAvailable(email) {
  return api.get('/register/checkEmailAvaibility', {params: {query: email}});
}

function observeFromEvent(eventSource, event, mapFunc, subscribeFunc) {
  if (typeof subscribeFunc !== 'function' || typeof mapFunc !== 'function') {
    throw Error('subscribeFunc and mapFunc must be a function');
  }
  return Rx.Observable.fromEvent(eventSource, event)
    .distinctUntilChanged()
    .debounce(500)
    .map(mapFunc)
    .subscribe(subscribeFunc, err => {console.log(`Observable event: `, err);});
}

@connect(
  state => ({user: state.auth.user}),
  authActions)
export default class Register extends Component {
  static propTypes = {
    user: PropTypes.object,
    register: PropTypes.func
  }

  componentDidMount() {
    let {username: usernameInput, password: passwordInput, retypePassword: retypePasswordInput, email: emailInput, submit: submitButton} = this.refs;
    
    let isComplete = {u: null, p: null, rp: null, e: null};
    
    submitButton.setAttribute('disabled', 'disabled');
    let usernameInputObserver = Rx.Observable.fromEvent(usernameInput, 'keyup')
      .map(() => usernameInput.value)
      .distinctUntilChanged()
      .debounce(500);
    usernameInputObserver
      .filter(text => text.length < 4)
      .subscribe(() => {
        isComplete.u = false;
        React.findDOMNode(this.refs.tooShortTooltip).classList.add('in');
        React.findDOMNode(this.refs.notAvailableTooltip).classList.remove('in');
      });
    usernameInputObserver
      .filter(text => text.length >= 4)
      .flatMapLatest(isUsernameAvailable)
      .subscribe(
        result => {
          React.findDOMNode(this.refs.tooShortTooltip).classList.remove('in');
          
          let node = React.findDOMNode(this.refs.notAvailableTooltip);
          isComplete.u = result;
          return isComplete.u ? node.classList.remove('in') : node.classList.add('in');
        },
        err => {console.log(err);}
      );
      
    observeFromEvent(passwordInput, 'keyup', () => passwordInput.value, password => {
      isComplete.p = password.length >= 6;
      if (isComplete.rp !== null) {
        isComplete.rp = password === retypePasswordInput.value;
      }
    });
    
    observeFromEvent(retypePasswordInput, 'keyup', () => retypePasswordInput.value, retypePassword => {
      isComplete.rp = retypePassword === passwordInput.value;
    });
    
    observeFromEvent(emailInput, 'keyup', () => emailInput.value, email => {
      if (!!email.match(/.+@.+\..+/i)) {
        React.findDOMNode(this.refs.wrongEmailTooltip).classList.remove('in');
        isEmailAvailable(email).then(result => {isComplete.e = result;});
      } else {
        React.findDOMNode(this.refs.emailNotAvailableTooltip).classList.remove('in');
        React.findDOMNode(this.refs.wrongEmailTooltip).classList.add('in');
      }
    });
    
    let isCompleteObserver = Rx.Observable.ofObjectChanges(isComplete);
    isCompleteObserver.subscribe(x => {
      switch (x.name) {
        case 'p':
          x.object.p !== false ? React.findDOMNode(this.refs.passwordTooShortTooltip).classList.remove('in') : React.findDOMNode(this.refs.passwordTooShortTooltip).classList.add('in');
          break;
        case 'rp':
          x.object.rp !== false ? React.findDOMNode(this.refs.passwordDoesntMatchTooltip).classList.remove('in') : React.findDOMNode(this.refs.passwordDoesntMatchTooltip).classList.add('in');
          break;
        case 'e':
          x.object.e !== false ? React.findDOMNode(this.refs.emailNotAvailableTooltip).classList.remove('in') : React.findDOMNode(this.refs.emailNotAvailableTooltip).classList.add('in');
          break;
        default:
      }
      
      if (Object.keys(x.object).every(key => {
        return x.object[key];
      }) === true) {
        submitButton.removeAttribute('disabled');
      } else {
        submitButton.setAttribute('disabled', 'disabled');
      }
    }, e => {
      console.log('completeObserver error: ', e);
    });
  }

  static fetchData(getState, dispatch) {
    if (!isAuthLoaded(getState())) {
      return dispatch(loadAuth());
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    let {username, password, retypePassword, email} = this.refs;
    this.props.register({username: username.value, password: password.value, email: email.value});
    username.value = password.value = retypePassword.value = email.value = '';
  }

  render() {
    const {user} = this.props;
    const styles = require('./Register.scss');
    return (
      <div className={styles.registerPage + ' container'}>
        <h1>Register</h1>
        {!user &&
        <div>
          <form className="register-form" onSubmit={::this.handleSubmit}>
            <div id="username-input">
              <input type="text" ref="username" placeholder="Enter a username"/>
              <Tooltip placement="right" ref="notAvailableTooltip" id="not-available-tooltip">Username is not available</Tooltip>
              <Tooltip placement="right" ref="tooShortTooltip" id="too-short-tooltip">Username must contains at least 4 characters</Tooltip>
            </div>
            <div id="password-input">
              <input type="password" ref="password" placeholder="Use a strong password"/>
              <Tooltip placement="right" ref="passwordTooShortTooltip" id="password-too-short-tooltip">Password must contains at least 6 characters</Tooltip>
            </div>
            <div id="retype-password-input">
              <input type="password" ref="retypePassword" placeholder="Retype your password"/>
              <Tooltip placement="right" ref="passwordDoesntMatchTooltip" id="password-doesnt-match-tooltip">Password doesn't match</Tooltip>
            </div>
            <div id="email-input">
              <input type="email" ref="email" placeholder="Use real email for confirmation"/>
              <Tooltip placement="right" ref="wrongEmailTooltip" id="wrong-email-tooltip">Please re-check your email</Tooltip>
              <Tooltip placement="right" ref="emailNotAvailableTooltip" id="email-not-available-tooltip">This email has been registered</Tooltip>
            </div>
            <button className="btn btn-success" ref="submit" onClick={::this.handleSubmit}><i className="fa fa-sign-in"/>{' '}Register</button>
          </form>
        </div>
        }
      </div>
    );
  }
}

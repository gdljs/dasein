import Axios from 'axios';

const internals = {};

/* global localStorage */

internals.kInitiateLoginRoute = '/api/auth/login';
internals.kHandleCallbackRoute = '/api/auth/callback';

export default internals.AuthService = class AuthService {

  constructor() {

    this.authenticated = false;

    // Bootstrap from local storage.
    if (localStorage.hasOwnProperty('user') && localStorage.hasOwnProperty('token')
        && localStorage.hasOwnProperty('expiresAt')) {

      if (parseInt(localStorage.getItem('expiresAt')) > Date.now()) {
        this.expiresAt = localStorage.getItem('expiresAt');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.token = localStorage.getItem('token');
        this.authenticated = true;
      }
    }
  }

  // Initiates the login process. Resolves to an object that contains the URL
  // to redirect to to continue processing.
  initiateLogin() {

    return Axios.get(internals.kInitiateLoginRoute).then((response) => {

      return response.data;
    });
  }

  // Posts the oAuthToken and verifier to the API to get back a user object
  // and a signed JWT
  getUserObject(oAuthToken, oAuthVerifier) {

    return Axios.post(internals.kHandleCallbackRoute, {
      oAuthToken,
      oAuthVerifier
    }).then((response) => {

      return response.data;
    });
  }

  // Logs in the user by setting the user and token
  login(user, token, expiresAt) {

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('expiresAt', expiresAt);
    this.user = user;
    this.token = token;
    this.expiresAt = expiresAt;
    this.authenticated = true;
  }

  // Logs a user out by removing the user and token
  logout() {

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expiresAt');
    delete this.user;
    delete this.token;
    delete this.expiresAt;
    this.authenticated = false;
  }
};

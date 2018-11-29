import { AngularSelector } from 'testcafe-angular-selectors';

export class ConfigurationPage {
  username: any;
  password: any;
  loginBtn: any;

  constructor () {
    const loginForm = AngularSelector('bc-login-form');

    this.username = loginForm.find('#md-input-1');
    this.password = loginForm.find('#md-input-3');
    this.loginBtn = loginForm.find('.mat-button');
  }

  navigateTo() {
    return browser.get('/#/configuration');
  }
}

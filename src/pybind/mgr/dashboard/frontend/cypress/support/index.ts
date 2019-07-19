import { Helper } from '../integration/helper.po';

before(() => {
  const username = 'admin';
  const password = 'admin';

  cy.visit('/#/login');

  cy.get('input[name=username]').type(username);
  cy.get('input[name=password]').type(password);
  cy.get('input[type="submit"]').click();

  cy.get('cd-info-group');
});

afterEach(function() {
  Helper.checkConsole();
  cy.log('I run before every test in every spec file!!!!!!');
});

import { Selector } from 'testcafe';
import { waitForAngular } from 'testcafe-angular-selectors';
import { ConfigurationPage } from './configuration.nc.po';

fixture `Book Collection`
  .page('https://miherlosev.github.io/e2e_angular/')
  .beforeEach(async t => {
    await waitForAngular();
  });

describe('Configuration page', () => {
  let page: ConfigurationPage;

  beforeAll(() => {
    page = new ConfigurationPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  it('should open and show breadcrumb', () => {
    page.navigateTo();
    expect(Helper.getBreadcrumbText()).toEqual('Configuration');
  });
});

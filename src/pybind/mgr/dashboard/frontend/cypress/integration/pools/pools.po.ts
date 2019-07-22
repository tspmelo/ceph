import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';

const pages = {
  index: '/#/pool',
  create: '/#/pool/create'
};

export class PoolPageHelper extends PageHelper {
  pages = pages;

  private isPowerOf2(n: number): boolean {
    // tslint:disable-next-line: no-bitwise
    return (n & (n - 1)) === 0;
  }

  @PageHelper.restrictTo(pages.index)
  exist(name: string, oughtToBePresent = true) {
    if (oughtToBePresent) {
      PageHelper.getTableCellByContent(name)
        .contains(name)
        .should('have.text', name);
    } else {
      PageHelper.getTableCellByContent(name).should('not.exist');
    }
  }

  // @PageHelper.restrictTo(pages.create)
  // create(name: string, placement_groups: number): promise.Promise<any> {
  //   const nameInput = $('input[name=name]');
  //   nameInput.clear();
  //   if (!this.isPowerOf2(placement_groups)) {
  //     return Promise.reject(`Placement groups ${placement_groups} are not a power of 2`);
  //   }
  //   return nameInput.sendKeys(name).then(() => {
  //     element(by.cssContainingText('select[name=poolType] option', 'replicated'))
  //       .click()
  //       .then(() => {
  //         expect(element(by.css('select[name=poolType] option:checked')).getText()).toBe(
  //           ' replicated '
  //         );
  //         $('input[name=pgNum]')
  //           .sendKeys(protractor.Key.CONTROL, 'a', protractor.Key.NULL, placement_groups)
  //           .then(() => {
  //             return element(by.css('cd-submit-button')).click();
  //           });
  //       });
  //   });
  // }

  // @PageHelper.restrictTo(pages.index)
  // delete(name: string): promise.Promise<any> {
  //   return PoolPageHelper.getTableCellByContent(name).then((tableCell: ElementFinder) => {
  //     return tableCell.click().then(() => {
  //       return $('.table-actions button.dropdown-toggle') // open submenu
  //         .click()
  //         .then(() => {
  //           return $('li.delete a') // click on "delete" menu item
  //             .click()
  //             .then(() => {
  //               const getConfirmationCheckbox = () => $('#confirmation');
  //               browser
  //                 .wait(() => EC.visibilityOf(getConfirmationCheckbox()), Helper.TIMEOUT)
  //                 .then(() => {
  //                   PageHelper.moveClick(getConfirmationCheckbox()).then(() => {
  //                     return element(by.cssContainingText('button', 'Delete Pool')).click(); // Click Delete item
  //                   });
  //                 });
  //             });
  //         });
  //     });
  //   });
  // }
}

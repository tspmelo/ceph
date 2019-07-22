/// <reference types="Cypress" />

interface Pages {
  index: string;
}

export abstract class PageHelper {
  pages: Pages;

  static getBreadcrumbText() {
    return cy.get('.breadcrumb-item.active span');
  }

  static getTabText(idx) {
    return cy.get('.nav.nav-tabs li').eq(idx);
  }

  static getTableCount() {
    return $('.datatable-footer-inner.selected-count').text();
  }

  static getTitleText() {
    return cy.get('.panel-title').invoke('text');
  }

  // static getTableCell(content) {
  //   return element(by.cssContainingText('.datatable-body-cell-label', content));
  // }

  // static getTable() {
  //   return element.all(by.css('.datatable-body'));
  // }

  static getTabs() {
    return cy.get('.nav.nav-tabs li');
  }

  // static getFirstTableCellWithText(content) {
  //   return element.all(by.cssContainingText('.datatable-body-cell-label', content)).first();
  // }

  /**
   * Used for instances where a modal container received the click rather than the desired element.
   *
   * https://stackoverflow.com/questions/26211751/protractor-chrome-driver-element-is-not-clickable-at-point
   */
  // static moveClick(object) {
  //   return browser
  //     .actions()
  //     .mouseMove(object)
  //     .click()
  //     .perform();
  // }

  /**
   * Returns the cell with the content given in `content`. Will not return a
   * rejected Promise if the table cell hasn't been found. It behaves this way
   * to enable to wait for visiblity/invisiblity/precense of the returned
   * element.
   *
   * It will return a rejected Promise if the result is ambigous, though. That
   * means if after the search for content has been completed, but more than a
   * single row is shown in the data table.
   */
  static getTableCellByContent(content: string) {
    cy.get('#pool-list > div .search input').as('searchInput');
    cy.get('#pool-list > div > div > .dataTables_paginate input').as('rowAmountInput');
    // cy.get('#pool-list > div datatable-footer').as('footer');

    cy.get('@rowAmountInput').clear();
    cy.get('@rowAmountInput').type('10');
    cy.get('@searchInput').clear();
    cy.get('@searchInput').type(content);

    return cy.get(`.datatable-body-cell-label`);
    // cy.get('@footer')
    //   .get('[ng-reflect-row-count]')
    //   .invoke('text')
    //   .then((rowCount) => {
    //     const count = Number(rowCount);
    //     if (count !== 0 && count > 1) {
    //       return Promise.reject('getTableCellByContent: Result is ambigous');
    //     } else {
    //       return element(
    //         by.cssContainingText('.datatable-body-cell-label', new RegExp(`^\\s${content}\\s$`))
    //       );
    //     }
    //   });
  }

  /**
   * Decorator to be used on Helper methods to restrict access to one
   * particular URL.  This shall help developers to prevent and highlight
   * mistakes.  It also reduces boilerplate code and by thus, increases
   * readability.
   */
  static restrictTo(page): any {
    // return cy.url().should('include', page);

    // return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    //   const fn: Function = descriptor.value;
    //   descriptor.value = function(...args) {
    //     return browser
    //       .getCurrentUrl()
    //       .then((url) =>
    //         url.endsWith(page)
    //           ? fn.apply(this, args)
    //           : promise.Promise.reject(
    //               `Method ${target.constructor.name}::${propertyKey} is supposed to be ` +
    //                 `run on path "${page}", but was run on URL "${url}"`
    //             )
    //       );
    //   };
    // };
  }

  navigateTo(page = null) {
    page = page || 'index';
    const url = this.pages[page];
    cy.visit(url);
  }
}

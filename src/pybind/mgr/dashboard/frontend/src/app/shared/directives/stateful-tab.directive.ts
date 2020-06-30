import { Directive, Host, HostListener, Input, OnInit, Optional } from '@angular/core';

import { NgbNav, NgbNavItem } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Directive({
  selector: '[cdStatefulTab]'
})
export class StatefulTabDirective implements OnInit {
  private localStorage = window.localStorage;
  private parentStateId: string;

  @Input()
  stateId: string;

  constructor(@Optional() @Host() private navItem: NgbNavItem) {}

  ngOnInit() {
    // Get the parent <ul> element.
    const ul: HTMLElement = this.navItem.elementRef.nativeElement.parentElement;
    if (ul instanceof HTMLElement) {
      // Get the `stateId` of the parent tabbed navigation component.
      this.parentStateId = ul.getAttribute('stateId');
      // Do we need to set this tab as activate?
      const storedStateId = this.localStorage.getItem(`tabset_${this.parentStateId}`);
      if (storedStateId === this.stateId) {
        // Select this tab.
        const nav: NgbNav = _.get(this.navItem, '_nav');
        nav.select(this.navItem.id);
      }
    }
  }

  @HostListener('click')
  onClick() {
    // Store the current active tab in the local storage.
    if (this.parentStateId && this.stateId) {
      this.localStorage.setItem(`tabset_${this.parentStateId}`, this.stateId);
    }
  }
}

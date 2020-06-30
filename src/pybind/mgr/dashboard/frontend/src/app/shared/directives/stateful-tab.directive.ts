import { Directive, Host, HostListener, Input, OnInit, Optional } from '@angular/core';

import { NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Directive({
  selector: '[cdStatefulTab]'
})
export class StatefulTabDirective implements OnInit {
  @Input() cdStatefulTab: string;

  private localStorage = window.localStorage;

  constructor(@Optional() @Host() private nav: NgbNav) {}

  ngOnInit() {
    const activeId = this.localStorage.getItem(`tabset_${this.cdStatefulTab}`);
    if (activeId) {
      this.nav.select(activeId);
    }
  }

  @HostListener('navChange', ['$event'])
  onNavChange(changeEvent: NgbNavChangeEvent) {
    // Store the current active tab in the local storage.
    if (this.cdStatefulTab && changeEvent.nextId) {
      this.localStorage.setItem(`tabset_${this.cdStatefulTab}`, changeEvent.nextId);
    }
  }
}

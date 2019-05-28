import { LOCALE_ID, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { I18n } from '@ngx-translate/i18n-polyfill';
import * as _ from 'lodash';

import { TableActionsComponent } from '../app/shared/datatable/table-actions/table-actions.component';
import { CdFormGroup } from '../app/shared/forms/cd-form-group';
import { Permission } from '../app/shared/models/permissions';
import {
  PrometheusAlert,
  PrometheusNotification,
  PrometheusNotificationAlert
} from '../app/shared/models/prometheus-alerts';
import { _DEV_ } from '../unit-test-configuration';
import { CdTableAction } from '../app/shared/models/cd-table-action';
import { CdTableSelection } from '../app/shared/models/cd-table-selection';

export function configureTestBed(configuration, useOldMethod?) {
  if (_DEV_ && !useOldMethod) {
    const resetTestingModule = TestBed.resetTestingModule;
    beforeAll((done) =>
      (async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule(configuration);
        // prevent Angular from resetting testing module
        TestBed.resetTestingModule = () => TestBed;
      })()
        .then(done)
        .catch(done.fail)
    );
    afterAll(() => {
      TestBed.resetTestingModule = resetTestingModule;
    });
  } else {
    beforeEach(async(() => {
      TestBed.configureTestingModule(configuration);
    }));
  }
}

export class PermissionHelper {
  tac: TableActionsComponent;
  permission: Permission;

  constructor(permission: Permission) {
    this.permission = permission;
  }

  setPermissionsAndGetActions(tableActions: CdTableAction[]): any {
    const result = {};
    [true, false].forEach((create) => {
      [true, false].forEach((update) => {
        [true, false].forEach((deleteP) => {
          this.permission.create = create;
          this.permission.update = update;
          this.permission.delete = deleteP;

          this.tac = new TableActionsComponent();
          this.tac.selection = new CdTableSelection();
          this.tac.tableActions = [...tableActions];
          this.tac.permission = this.permission;
          this.tac.ngOnInit();

          result[create + '-' + update + '-' + deleteP] = {
            actions: this.tac.tableActions.map((action) => action.name),
            primary: this.testScenarios()
          };
        });
      });
    });

    return result;
  }

  testScenarios() {
    const result: any = {};
    // 'multiple selections'
    result.multiple = this.testScenario([{}, {}]);
    // 'select executing item'
    result.executing = this.testScenario([{ cdExecuting: 'someAction' }]);
    // 'select non-executing item'
    result.single = this.testScenario([{}]);
    // 'no selection'
    result.no = this.testScenario([]);

    return result;
  }

  private testScenario(selection: object[]) {
    this.setSelection(selection);
    const btn = this.tac.getCurrentButton();
    return btn ? btn.name : '';
  }

  setSelection(selection: object[]) {
    this.tac.selection.selected = selection;
    this.tac.selection.update();
  }
}

export class FormHelper {
  form: CdFormGroup;

  constructor(form: CdFormGroup) {
    this.form = form;
  }

  /**
   * Changes multiple values in multiple controls
   */
  setMultipleValues(values: { [controlName: string]: any }, markAsDirty?: boolean) {
    Object.keys(values).forEach((key) => {
      this.setValue(key, values[key], markAsDirty);
    });
  }

  /**
   * Changes the value of a control
   */
  setValue(control: AbstractControl | string, value: any, markAsDirty?: boolean): AbstractControl {
    control = this.getControl(control);
    if (markAsDirty) {
      control.markAsDirty();
    }
    control.setValue(value);
    return control;
  }

  private getControl(control: AbstractControl | string): AbstractControl {
    if (typeof control === 'string') {
      return this.form.get(control);
    }
    return control;
  }

  /**
   * Change the value of the control and expect the control to be valid afterwards.
   */
  expectValidChange(control: AbstractControl | string, value: any, markAsDirty?: boolean) {
    this.expectValid(this.setValue(control, value, markAsDirty));
  }

  /**
   * Expect that the given control is valid.
   */
  expectValid(control: AbstractControl | string) {
    // 'isValid' would be false for disabled controls
    expect(this.getControl(control).errors).toBe(null);
  }

  /**
   * Change the value of the control and expect a specific error.
   */
  expectErrorChange(
    control: AbstractControl | string,
    value: any,
    error: string,
    markAsDirty?: boolean
  ) {
    this.expectError(this.setValue(control, value, markAsDirty), error);
  }

  /**
   * Expect a specific error for the given control.
   */
  expectError(control: AbstractControl | string, error: string) {
    expect(this.getControl(control).hasError(error)).toBeTruthy();
  }
}

export class FixtureHelper {
  fixture: ComponentFixture<any>;

  constructor(fixture: ComponentFixture<any>) {
    this.fixture = fixture;
  }

  /**
   * Expect a list of id elements to be visible or not.
   */
  expectIdElementsVisible(ids: string[], visibility: boolean) {
    ids.forEach((css) => {
      this.expectElementVisible(`#${css}`, visibility);
    });
  }

  /**
   * Expect a specific element to be visible or not.
   */
  expectElementVisible(css: string, visibility: boolean) {
    expect(Boolean(this.getElementByCss(css))).toBe(visibility);
  }

  expectFormFieldToBe(css: string, value: string) {
    const props = this.getElementByCss(css).properties;
    expect(props['value'] || props['checked'].toString()).toBe(value);
  }

  clickElement(css: string) {
    this.getElementByCss(css).triggerEventHandler('click', null);
    this.fixture.detectChanges();
  }

  getText(css: string) {
    const e = this.getElementByCss(css);
    return e ? e.nativeElement.textContent.trim() : null;
  }

  getElementByCss(css: string) {
    this.fixture.detectChanges();
    return this.fixture.debugElement.query(By.css(css));
  }
}

export class PrometheusHelper {
  createAlert(name, state = 'active', timeMultiplier = 1) {
    return {
      fingerprint: name,
      status: { state },
      labels: {
        alertname: name
      },
      annotations: {
        summary: `${name} is ${state}`
      },
      generatorURL: `http://${name}`,
      startsAt: new Date(new Date('2022-02-22').getTime() * timeMultiplier).toString()
    } as PrometheusAlert;
  }

  createNotificationAlert(name, status = 'firing') {
    return {
      status: status,
      labels: {
        alertname: name
      },
      annotations: {
        summary: `${name} is ${status}`
      },
      generatorURL: `http://${name}`
    } as PrometheusNotificationAlert;
  }

  createNotification(alertNumber = 1, status = 'firing') {
    const alerts = [];
    for (let i = 0; i < alertNumber; i++) {
      alerts.push(this.createNotificationAlert('alert' + i, status));
    }
    return { alerts, status } as PrometheusNotification;
  }

  createLink(url) {
    return `<a href="${url}" target="_blank"><i class="fa fa-line-chart"></i></a>`;
  }
}

const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
    </body>
  </file>
</xliff>
`;

const i18nProviders = [
  { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
  { provide: TRANSLATIONS, useValue: XLIFF },
  { provide: LOCALE_ID, useValue: 'en' },
  I18n
];

export { i18nProviders };

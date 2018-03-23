import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr';

import * as _ from 'lodash';
import { SharedModule } from '../../../shared/shared.module';
import { ErasureCodeProfileService } from '../erasure-code-profile/erasure-code-profile.service';
import { PoolFormComponent } from './pool-form.component';
import { UnitTestHelper } from '../../../shared/unit-test-helper';

describe('PoolFormComponent', () => {
  let component: PoolFormComponent;
  let fixture: ComponentFixture<PoolFormComponent>;
  const unitTestHelper = new UnitTestHelper();

  const setValue = (controlName, value, valid?) => {
    const control = component.formGet(controlName);
    control.setValue(value);
    if (!_.isUndefined(valid)) {
      if (valid) {
        control.setErrors(null);
      } else {
        control.setErrors({'sth': true});
      }
      control.updateValueAndValidity();
    }
  };

  unitTestHelper.staticTestBed({
    declarations: [ PoolFormComponent ],
    imports: [
      ReactiveFormsModule,
      SharedModule,
      HttpClientTestingModule,
      RouterTestingModule,
      ToastModule.forRoot(),
      FormsModule
    ],
    providers: [ErasureCodeProfileService]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolFormComponent);
    component = fixture.componentInstance;
    component.info = { // Simple info mock
      pool_names: [],
      osd_count: 8,
      is_all_bluestore: true,
      compression_algorithms: [],
      compression_modes: [],
      crush_rules_replicated: [],
      crush_rules_erasure: []
    };
    component.ecProfiles = [];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.poolForm).toBeTruthy();
    expect(component.compressionForm).toBeTruthy();
    expect(component.appForm).toBeTruthy();
  });

  describe('pool form validation', () => {
    const changeValue = (name: string, value: any) => {
      const control = component.formGet(name);
      control.setValue(value);
      return control;
    };

    const hasError = (name: string, error: string) => {
      expect(component.formGet(name).hasError(error)).toBeTruthy();
    };

    const isValid = (name: string) => {
      expect(component.formGet(name).valid).toBeTruthy();
    };

    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid at the beginning all sub forms should be valid however', () => {
      expect(component.poolForm.valid).toBeFalsy();
      ['name', 'poolType', 'pgNum'].forEach((name) => hasError(name, 'required'));
      ['crushRule', 'size', 'erasureProfile', 'ecOverwrites'].forEach(isValid);
      expect(component.compressionForm.valid).toBeTruthy();
      expect(component.appForm.valid).toBeTruthy();
    });

    it('should test name validation', () => {
      hasError('name', 'required');
      changeValue('name', 'some-name');
      isValid('name');
      component.info.pool_names.push('someExistingPoolName');
      changeValue('name', 'someExistingPoolName');
      hasError('name', 'uniqueName');
      changeValue('name', 'wrong format with spaces');
      hasError('name', 'pattern');
    });

    it('should test poolType validation', () => {
      hasError('poolType', 'required');
      changeValue('poolType', 'erasure');
      isValid('poolType');
      changeValue('poolType', 'replicated');
      isValid('poolType');
    });

    it('should test pgNum validation', () => {
      hasError('pgNum', 'required');
      const control = changeValue('pgNum', '-28');
      expect(control.value).toBe(1);
      isValid('pgNum');
    });

    it('is valid if pgNum, poolType and name are valid', () => {
      changeValue('name', 'some-name');
      changeValue('poolType', 'erasure');
      changeValue('pgNum', 1);
      expect(component.poolForm.valid).toBeTruthy();
    });

    it('should test crushRule validation', () => {
      isValid('crushRule');
      changeValue('crushRule', {min_size: 20});
      hasError('crushRule', 'toFewOsds');
    });

    it('should test size validation', () => {
      changeValue('poolType', 'replicated');
      isValid('size');
      changeValue('crushRule', {
        min_size: 2,
        max_size: 6
      });
      changeValue('size', 1);
      hasError('size', 'min');
      changeValue('size', 8);
      hasError('size', 'max');
      changeValue('size', 6);
      isValid('size');
    });

    describe('compression form validation', () => {
      beforeEach(() => {
        changeValue('poolType', 'replicated');
        changeValue('mode', 'passive');
      });

      it('should be valid', () => {
        expect(component.compressionForm.valid).toBeTruthy();
      });

      it('should minBlobSize can be a number below 0', () => {
        changeValue('minBlobSize', -1);
        hasError('minBlobSize', 'min');
        const control = changeValue('minBlobSize', '1');
        fixture.detectChanges();
        isValid('minBlobSize');
        expect(control.value).toBe('1KiB');
      });

      it('should maxBlobSize can be a number below 0', () => {
        changeValue('maxBlobSize', -1);
        hasError('maxBlobSize', 'min');
        const control = changeValue('maxBlobSize', '1');
        fixture.detectChanges();
        isValid('maxBlobSize');
        expect(control.value).toBe('1KiB');
      });

      it('should validate ratio to be only valid between 0 and 1', () => {
        isValid('ratio');
        changeValue('ratio', -0.1);
        hasError('ratio', 'min');
        changeValue('ratio', 0);
        isValid('ratio');
        changeValue('ratio', 1);
        isValid('ratio');
        changeValue('ratio', 1.1);
        hasError('ratio', 'max');
      });
    });

    describe('application form validation', () => {
      it('should be valid', () => {
        expect(component.appForm.valid).toBeTruthy();
      });

      it('validates customApp', () => {
        isValid('customApp');
        changeValue('customApp', '?');
        hasError('customApp', 'pattern');
        changeValue('customApp', 'Ab3_');
        isValid('customApp');
        changeValue('customApp', 'a'.repeat(129));
        hasError('customApp', 'maxlength');
      });
    });
  });

  describe('pool type changes', () => {
    // triggers rulesChange & pcCalc & replicatedRuleChange if replicated
    const changePoolType = (type: string) => {
      setValue('poolType', type);
    };

    const createRule = ({id, name, min, max, type}) => {
      const typeNumber = type === 'erasure' ? 3 : 1;
      return {
        min_size: min,
        rule_name: name,
        steps: [{
          item_name: 'default',
          item: -1,
          op: 'take'
        }, {
          num: 0,
          type: 'osd',
          op: 'choose_firstn'
        }, {
          op: 'emit'
        }],
        ruleset: id,
        type: typeNumber,
        rule_id: id,
        max_size: max
      };
    };

    beforeEach(() => {
      component.info.crush_rules_replicated = [
        createRule({id: 0, min: 2, max: 4, name: 'rep1', type: 'replicated' }),
        createRule({id: 1, min: 3, max: 18, name: 'rep2', type: 'replicated' })
      ];
      component.info.crush_rules_erasure = [
        createRule({id: 3, min: 1, max: 1, name: 'ep1', type: 'erasure' })
      ];
    });

    describe('replicatedRuleChange', () => {
      beforeEach(() => {
        changePoolType('replicated');
        setValue('crushRule', component.info.crush_rules_replicated[0]);
        setValue('size', 199);
      });

      it('should not set size if crushRule or not a replicated pool is not set', () => {
        changePoolType('erasure');
        expect(component.isSet('size')).toBe(199);
        changePoolType('replicated');
        setValue('crushRule', null);
        expect(component.isSet('size')).toBe(199);
      });

      it('should set size to maximum is size exceeds maximum', () => {
        component.replicatedRuleChange();
        expect(component.isSet('size')).toBe(4);
      });

      it('should set size to minimum if size is lower than minimum', () => {
        setValue('size', 1);
        component.replicatedRuleChange();
        expect(component.isSet('size')).toBe(2);
      });
    });

    describe('rulesChange', () => {
      it('should do nothing if info is not there', () => {
        delete component.info;
        changePoolType('replicated');
        expect(component.current.rules).toEqual([]);
      });

      it('should do nothing if pool type is not there', () => {
        component.rulesChange();
        expect(component.current.rules).toEqual([]);
      });

      it('should show all replicated rules when the type is replicated', () => {
        changePoolType('replicated');
        expect(component.current.rules).toEqual(component.info.crush_rules_replicated);
      });

      it('should show all erasure rules when the type is erasure', () => {
        changePoolType('erasure');
        expect(component.current.rules).toEqual(component.info.crush_rules_erasure);
      });

      it('should select the first rule if only one is there and disable the rule field', () => {
        changePoolType('erasure');
        const control = component.formGet('crushRule');
        expect(control.value).toEqual(component.info.crush_rules_erasure[0]);
        expect(control.disabled).toBe(true);
      });

      it('should not select the first rule if more than one are there', () => {
        changePoolType('replicated');
        const control = component.formGet('crushRule');
        expect(control.value).toEqual(null);
        expect(control.disabled).toBe(false);
      });

      it('should be able to change between both types without any side effects', () => {
        changePoolType('erasure');
        changePoolType('replicated');
        const control = component.formGet('crushRule');
        expect(control.value).toEqual(null);
        expect(control.disabled).toBe(false);
        changePoolType('erasure');
        expect(control.value).toEqual(component.info.crush_rules_erasure[0]);
        expect(control.disabled).toBe(true);
      });
    });
  });

  describe('getMaxSize and getMinSize', () => {
    const setCrushRule = ({min, max}: {min?: number, max?: number}) => {
      setValue('crushRule', {
        min_size: min || 2,
        max_size: max || 10
      });
    };

    it('should return nothing if info is not there or the osd count is 0', () => {
      setCrushRule({});
      component.info.osd_count = 0;
      expect(component.getMinSize()).toBe(undefined);
      expect(component.getMaxSize()).toBe(undefined);
      delete component.info;
      expect(component.getMinSize()).toBe(undefined);
      expect(component.getMaxSize()).toBe(undefined);
    });

    it('should return minimum and maximum of rule', () => {
      setCrushRule({max: 6});
      expect(component.getMinSize()).toBe(2);
      expect(component.getMaxSize()).toBe(6);
    });

    it('should return 1 and osd count if no crush rule is available', () => {
      setValue('crushRule', null);
      expect(component.getMinSize()).toBe(1);
      expect(component.getMaxSize()).toBe(8);
    });

    it('should return the osd count as maximum if the rule maximum exceeds it', () => {
      setCrushRule({max: 100});
      expect(component.getMaxSize()).toBe(8);
    });

    it('should return the osd count as minimum if its lower the the rule minimum', () => {
      setCrushRule({min: 10});
      expect(component.getMinSize()).toBe(10);
      const control = component.formGet('crushRule');
      expect(control.invalid).toBe(true);
      expect(control.hasError('toFewOsds')).toBe(true);
    });
  });

  describe('app changes', () => {
    const testAddApp = (app?: string, result?: string[]) => {
      component.addApp(app);
      expect(component.data.apps).toEqual(result);
    };

    const testRemoveApp = (app: string, result: string[]) => {
      component.removeApp(app);
      expect(component.data.apps).toEqual(result);
    };

    const setCurrentApps = (apps: string[]) => {
      component.data.apps = apps;
      return apps;
    };

    it('should add app to the list of apps', () => {
      testAddApp('a', ['a']);
      testAddApp('b', ['b', 'a']);
    });

    it('should add app from appSelection value', () => {
      setValue('appSelection', 'a');
      testAddApp(undefined, ['a']);
      setValue('appSelection', 'b');
      testAddApp(undefined, ['b', 'a']);
    });

    it('should remove empty apps on adding', () => {
      const apps = setCurrentApps([ '', 'b', 'a']);
      testAddApp('c', ['c', 'b', 'a']);
    });

    it('should not add apps if the maximum of possible apps is reached (4)', () => {
      const apps = setCurrentApps(['d', 'c', 'b', 'a']);
      testAddApp('e', apps);
    });

    it('should remove apps', () => {
      const apps = setCurrentApps(['d', 'c', 'b', 'a']);
      testRemoveApp('c', ['d', 'b', 'a']);
      testRemoveApp('a', ['d', 'b']);
      testRemoveApp('d', ['b']);
      testRemoveApp('b', []);
    });

    it('should not remove any app that is not in apps', () => {
      const apps = setCurrentApps(['d', 'c', 'b', 'a']);
      testRemoveApp('e', ['d', 'c', 'b', 'a']);
      testRemoveApp('0', ['d', 'c', 'b', 'a']);
    });

    it('should filter out already seted apps in getAvailApps', () => {
      expect(component.getAvailApps()).toEqual(['cephfs', 'rbd', 'rgw']);
      setCurrentApps(['cephfs', 'rbd']);
      expect(component.getAvailApps()).toEqual(['rgw']);
      setCurrentApps(['rbd']);
      expect(component.getAvailApps()).toEqual(['cephfs', 'rgw']);
    });
  });

  describe('pg changes', () => {
    beforeEach(() => {
      // triggers pgUpdate
      setValue('pgNum', 256);
    });

    describe('pgCalc', () => {
      const getValidCase = () => ({
        type: 'replicated',
        osds: 8,
        size: {
          value: 4,
          valid: true
        },
        ecp: {
          value: {
            k: 2,
            m: 2
          },
          valid: true
        },
        expected: 256
      });

      const testPgCalc = ({type, osds, size, ecp, expected}) => {
        component.info.osd_count = osds;
        setValue('poolType', type);
        if (type === 'replicated') {
          setValue('size', size.value, size.valid);
        } else {
          setValue('erasureProfile', ecp.value, ecp.valid);
        }
        expect(component.isSet('pgNum')).toBe(expected);
      };

      it('should not change anything if not type is selected', () => {
        const test = getValidCase();
        test.type = '';
        testPgCalc(test);
      });

      it('should not change anything if size is not valid', () => {
        let test = getValidCase();
        test.size.value = 0;
        testPgCalc(test);
        test = getValidCase();
        test.size.valid = false;
        testPgCalc(test);
      });

      it('should not change anything if ecp is not valid', () => {
        const test = getValidCase();
        test.type = 'erasure';
        test.ecp.valid = false;
        testPgCalc(test);
        test.ecp.valid = true;
        test.ecp.value = null;
        testPgCalc(test);
      });

      it('should calculate some replicated values', () => {
        const test = getValidCase();
        testPgCalc(test);
        test.osds = 16;
        test.expected = 512;
        testPgCalc(test);
        test.osds = 8;
        test.size.value = 12;
        test.expected = 64;
        testPgCalc(test);
      });

      it('should calculate some erasure code values', () => {
        const test = getValidCase();
        test.type = 'erasure';
        testPgCalc(test);
        test.osds = 16;
        test.ecp.value.m = 5;
        test.expected = 256;
        testPgCalc(test);
        test.ecp.value.k = 5;
        test.expected = 128;
        testPgCalc(test);
      });
    });

    describe('pgUpdate', () => {
      const testPgUpdate = (pgs, jump, returnValue) => {
        component.pgUpdate(pgs, jump);
        expect(component.isSet('pgNum')).toBe(returnValue);
      };

      it('should use only value parameter', () => {
        testPgUpdate(10, undefined, 8);
        testPgUpdate(22, undefined, 16);
        testPgUpdate(26, undefined, 32);
      });

      it('should use only jump parameter', () => {
        testPgUpdate(undefined, 1, 512);
        testPgUpdate(undefined, -1, 256);
        testPgUpdate(undefined, -2, 64);
        testPgUpdate(undefined, -10, 1);
      });

      it('should return minimum for false numbers', () => {
        testPgUpdate(-26, undefined, 1);
        testPgUpdate(0, undefined, 1);
        testPgUpdate(undefined, -20, 1);
      });

      it('should use all parameters', () => {
        testPgUpdate(330, 0, 256);
        testPgUpdate(230, 2, 1024);
        testPgUpdate(230, 3, 2048);
      });
    });

    describe('pgKeyUp', () => {
      const testPgKeyUp = (keyName, returnValue) => {
        component.pgKeyUp({key: keyName});
        expect(component.isSet('pgNum')).toBe(returnValue);
      };

      it('should do nothing with unrelated keys', () => {
        testPgKeyUp('0', 256);
        testPgKeyUp(',', 256);
        testPgKeyUp('a', 256);
        testPgKeyUp('Space', 256);
        testPgKeyUp('ArrowLeft', 256);
        testPgKeyUp('ArrowRight', 256);
      });

      it('should increment with plus or ArrowUp', () => {
        testPgKeyUp('ArrowUp', 512);
        testPgKeyUp('ArrowUp', 1024);
        testPgKeyUp('+', 2048);
        testPgKeyUp('+', 4096);
      });

      it('should decrement with minus or ArrowDown', () => {
        testPgKeyUp('ArrowDown', 128);
        testPgKeyUp('ArrowDown', 64);
        testPgKeyUp('-', 32);
        testPgKeyUp('-', 16);
      });
    });
  });
});

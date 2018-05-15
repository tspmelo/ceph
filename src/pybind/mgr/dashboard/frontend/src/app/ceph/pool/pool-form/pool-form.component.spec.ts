import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import * as _ from 'lodash';
import { ToastModule } from 'ng2-toastr';
import { Observable } from 'rxjs/Observable';

import { PoolService } from '../../../shared/api/pool.service';
import { CrushRule } from '../../../shared/models/crush-rule';
import { SharedModule } from '../../../shared/shared.module';
import { ErasureCodeProfileService } from '../erasure-code-profile/erasure-code-profile.service';
import { Pool } from '../pool';
import { PoolFormComponent } from './pool-form.component';

describe('PoolFormComponent', () => {
  let component: PoolFormComponent;
  let fixture: ComponentFixture<PoolFormComponent>;
  let poolService: PoolService;

  const allControlNames = [
    'name',
    'poolType',
    'crushRule',
    'size',
    'erasureProfile',
    'pgNum',
    'ecOverwrites',
    'mode',
    'algorithm',
    'minBlobSize',
    'maxBlobSize',
    'ratio',
    'appSelection',
    'customApp'
  ];

  const setValue = (controlName: string, value: any, valid?: any): AbstractControl => {
    const control = component.formGet(controlName);
    control.setValue(value);
    if (!_.isUndefined(valid)) {
      if (valid) {
        control.setErrors(null);
      } else {
        control.setErrors({ sth: true });
      }
      control.updateValueAndValidity();
    }
    return control;
  };

  const createRule = ({
    id = 0,
    name = 'somePoolName',
    min = 1,
    max = 10,
    type = 'replicated'
  }: {
    max?: number;
    min?: number;
    id?: number;
    name?: string;
    type?: string;
  }) => {
    const typeNumber = type === 'erasure' ? 3 : 1;
    const rule = new CrushRule();
    rule.max_size = max;
    rule.min_size = min;
    rule.rule_id = id;
    rule.ruleset = typeNumber;
    rule.rule_name = name;
    rule.steps = [
      {
        item_name: 'default',
        item: -1,
        op: 'take'
      },
      {
        num: 0,
        type: 'osd',
        op: 'choose_firstn'
      },
      {
        op: 'emit'
      }
    ];
    component.info['crush_rules_' + type].push(rule);
    return rule;
  };

  const hasError = (control: AbstractControl, error: string) => {
    expect(control.hasError(error)).toBeTruthy();
  };

  const isValid = (control: AbstractControl) => {
    expect(control.valid).toBeTruthy();
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PoolFormComponent],
      imports: [
        ReactiveFormsModule,
        SharedModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ToastModule.forRoot(),
        FormsModule
      ],
      providers: [
        ErasureCodeProfileService,
        { provide: ActivatedRoute, useValue: { params: Observable.of({ name: 'somePoolName' }) } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.info = {
      // Simple info mock
      pool_names: [],
      osd_count: 8,
      is_all_bluestore: true,
      compression_algorithms: [],
      compression_modes: [],
      crush_rules_replicated: [],
      crush_rules_erasure: []
    };
    component.ecProfiles = [];
    poolService = TestBed.get(PoolService);
    spyOn(poolService, 'getInfo').and.callFake(() => [component.info]);
    const ecpService = TestBed.get(ErasureCodeProfileService);
    spyOn(ecpService, 'getList').and.callFake(() => [component.ecProfiles]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.poolForm).toBeTruthy();
    expect(component.compressionForm).toBeTruthy();
    expect(component.appForm).toBeTruthy();
  });

  it('should call all needed functions during init', () => {
    spyOn(component, 'initInfo').and.callThrough();
    spyOn(component, 'initEcp').and.callThrough();
    spyOn(component, 'listenToChanges').and.callThrough();
    spyOn(component, 'enableComplexValidators').and.callThrough();

    expect(component.editing).toBeFalsy();
    expect(component.initInfo).not.toHaveBeenCalled();
    expect(component.initEcp).not.toHaveBeenCalled();
    expect(component.listenToChanges).not.toHaveBeenCalled();
    expect(component.enableComplexValidators).not.toHaveBeenCalled();

    component.ngOnInit();
    expect(component.editing).toBeFalsy();
    expect(component.initInfo).toHaveBeenCalled();
    expect(component.initEcp).toHaveBeenCalled();
    expect(component.listenToChanges).toHaveBeenCalled();
    expect(component.enableComplexValidators).toHaveBeenCalled();
  });

  describe('pool form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid at the beginning all sub forms should be valid however', () => {
      expect(component.poolForm.valid).toBeFalsy();
      ['name', 'poolType', 'pgNum'].forEach((name) =>
        hasError(component.formGet(name), 'required')
      );
      ['crushRule', 'size', 'erasureProfile', 'ecOverwrites'].forEach((name) =>
        isValid(component.formGet(name))
      );
      expect(component.compressionForm.valid).toBeTruthy();
      expect(component.appForm.valid).toBeTruthy();
    });

    it('should test name validation', () => {
      hasError(component.formGet('name'), 'required');
      isValid(setValue('name', 'some-name'));
      component.info.pool_names.push('someExistingPoolName');
      hasError(setValue('name', 'someExistingPoolName'), 'uniqueName');
      hasError(setValue('name', 'wrong format with spaces'), 'pattern');
    });

    it('should test poolType validation', () => {
      hasError(component.formGet('poolType'), 'required');
      isValid(setValue('poolType', 'erasure'));
      isValid(setValue('poolType', 'replicated'));
    });

    it('should test pgNum validation', () => {
      hasError(component.formGet('pgNum'), 'required');
      isValid(setValue('pgNum', '-28'));
      expect(component.isSet('pgNum')).toBe(1);
      isValid(setValue('pgNum', '15'));
      expect(component.isSet('pgNum')).toBe(16);
    });

    it('should test pgNum validation in edit mode', () => {
      component.data.pool = new Pool();
      component.data.pool.pg_num = 16;
      component.editing = true;
      component.enableComplexValidators();
      hasError(setValue('pgNum', '8'), 'noDecrease');
    });

    it('is valid if pgNum, poolType and name are valid', () => {
      setValue('name', 'some-name');
      setValue('poolType', 'erasure');
      setValue('pgNum', 1);
      expect(component.poolForm.valid).toBeTruthy();
    });

    it('should test crushRule validation', () => {
      isValid(component.formGet('crushRule'));
      hasError(setValue('crushRule', { min_size: 20 }), 'toFewOsds');
    });

    it('should test size validation', () => {
      setValue('poolType', 'replicated');
      isValid(component.formGet('size'));
      setValue('crushRule', {
        min_size: 2,
        max_size: 6
      });
      hasError(setValue('size', 1), 'min');
      hasError(setValue('size', 8), 'max');
      isValid(setValue('size', 6));
    });

    describe('compression form validation', () => {
      beforeEach(() => {
        setValue('poolType', 'replicated');
        setValue('mode', 'passive');
      });

      it('should be valid', () => {
        expect(component.compressionForm.valid).toBeTruthy();
      });

      it('should validate minBlobSize', () => {
        setValue('maxBlobSize', '2KiB');
        hasError(setValue('minBlobSize', -1), 'min');
        const control = setValue('minBlobSize', '1');
        fixture.detectChanges();
        isValid(control);
        expect(control.value).toBe('1KiB');
        hasError(setValue('minBlobSize', '3KiB'), 'maximum');
      });

      it('should validate maxBlobSize', () => {
        hasError(setValue('maxBlobSize', -1), 'min');
        setValue('minBlobSize', '1');
        const control = setValue('maxBlobSize', '2');
        fixture.detectChanges();
        isValid(control);
        expect(control.value).toBe('2KiB');
        hasError(setValue('maxBlobSize', '0.5KiB'), 'minimum');
      });

      it('should validate ratio to be only valid between 0 and 1', () => {
        isValid(component.formGet('ratio'));
        hasError(setValue('ratio', -0.1), 'min');
        isValid(setValue('ratio', 0));
        isValid(setValue('ratio', 1));
        hasError(setValue('ratio', 1.1), 'max');
      });
    });

    describe('application form validation', () => {
      it('should be valid', () => {
        expect(component.appForm.valid).toBeTruthy();
      });

      it('validates customApp', () => {
        isValid(component.formGet('customApp'));
        hasError(setValue('customApp', '?'), 'pattern');
        isValid(setValue('customApp', 'Ab3_'));
        hasError(setValue('customApp', 'a'.repeat(129)), 'maxlength');
      });
    });
  });

  describe('pool type changes', () => {
    // triggers rulesChange & pcCalc & replicatedRuleChange if replicated
    const changePoolType = (type: string) => {
      setValue('poolType', type);
    };

    beforeEach(() => {
      component.info.crush_rules_replicated = [
        createRule({ id: 0, min: 2, max: 4, name: 'rep1', type: 'replicated' }),
        createRule({ id: 1, min: 3, max: 18, name: 'rep2', type: 'replicated' })
      ];
      component.info.crush_rules_erasure = [
        createRule({ id: 3, min: 1, max: 1, name: 'ep1', type: 'erasure' })
      ];
      component.ngOnInit();
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
    const setCrushRule = ({ min, max }: { min?: number; max?: number }) => {
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
      setCrushRule({ max: 6 });
      expect(component.getMinSize()).toBe(2);
      expect(component.getMaxSize()).toBe(6);
    });

    it('should return 1 and osd count if no crush rule is available', () => {
      setValue('crushRule', null);
      expect(component.getMinSize()).toBe(1);
      expect(component.getMaxSize()).toBe(8);
    });

    it('should return the osd count as maximum if the rule maximum exceeds it', () => {
      setCrushRule({ max: 100 });
      expect(component.getMaxSize()).toBe(8);
    });

    it('should return the osd count as minimum if its lower the the rule minimum', () => {
      setCrushRule({ min: 10 });
      expect(component.getMinSize()).toBe(10);
      const control = component.formGet('crushRule');
      expect(control.invalid).toBe(true);
      hasError(control, 'toFewOsds');
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
      setCurrentApps(['', 'b', 'a']);
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
      setValue('crushRule', {
        min_size: 1,
        max_size: 20
      });
      component.ngOnInit();
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

      const testPgCalc = ({ type, osds, size, ecp, expected }) => {
        component.info.osd_count = osds;
        setValue('poolType', type);
        if (type === 'replicated') {
          setValue('size', size.value, size.valid);
        } else {
          setValue('erasureProfile', ecp.value, ecp.valid);
        }
        expect(component.isSet('pgNum')).toBe(expected);
      };

      beforeEach(() => {
        // Prevent an error through calculations
        spyOn(component, 'getMaxSize').and.returnValue(200);
      });

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
        component.pgKeyUp({ key: keyName });
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
  describe('submit', () => {
    const setMultipleValues = (settings: {}) => {
      Object.keys(settings).forEach((name) => {
        setValue(name, settings[name]);
      });
    };

    beforeEach(() => {
      createRule({ name: 'replicatedRule' });
      createRule({ name: 'erasureRule', type: 'erasure', id: 1 });
      spyOn(component, 'createAction');
    });

    it('should test minimum requirements for a erasure code pool', () => {
      setMultipleValues({
        name: 'minECPool',
        poolType: 'erasure',
        pgNum: 4
      });
      component.submit();
      expect(component.createAction).toHaveBeenCalledWith({
        pool: 'minECPool',
        pool_type: 'erasure',
        pg_num: 4
      });
    });

    it('should test minimum requirements for a replicated pool', () => {
      const ecp = { name: 'ecpMinimalMock' };
      setMultipleValues({
        name: 'minRepPool',
        poolType: 'replicated',
        size: 2,
        erasureProfile: ecp, // Will be ignored
        pgNum: 8
      });
      component.submit();
      expect(component.createAction).toHaveBeenCalledWith({
        pool: 'minRepPool',
        pool_type: 'replicated',
        pg_num: 8,
        size: 2
      });
    });

    it('should test a erasure code pool with erasure coded profile', () => {
      const ecp = { name: 'ecpMinimalMock' };
      setMultipleValues({
        name: 'ecpPool',
        poolType: 'erasure',
        pgNum: 16,
        size: 2, // Will be ignored
        erasureProfile: ecp
      });
      component.submit();
      expect(component.createAction).toHaveBeenCalledWith({
        pool: 'ecpPool',
        pool_type: 'erasure',
        pg_num: 16,
        erasure_code_profile: ecp.name
      });
    });

    it('should test ec_overwrite flag with erasure code pool', () => {
      setMultipleValues({
        name: 'ecOverwrites',
        poolType: 'erasure',
        pgNum: 32,
        ecOverwrites: true
      });
      component.submit();
      expect(component.createAction).toHaveBeenCalledWith({
        pool: 'ecOverwrites',
        pool_type: 'erasure',
        pg_num: 32,
        flags: ['ec_overwrites']
      });
    });
    it('should test pool compression', () => {
      setMultipleValues({
        name: 'compression',
        poolType: 'erasure',
        pgNum: 64,
        mode: 'passive',
        algorithm: 'lz4',
        minBlobSize: '4 K',
        maxBlobSize: '4 M',
        ratio: 0.7
      });
      component.submit();
      expect(component.createAction).toHaveBeenCalledWith({
        pool: 'compression',
        pool_type: 'erasure',
        pg_num: 64,
        compression_mode: 'passive',
        compression_algorithm: 'lz4',
        compression_min_blob_size: 4096,
        compression_max_blob_size: 4194304,
        compression_required_ratio: 0.7
      });
    });
  });

  describe('edit mode', () => {
    let url;
    let pool: Pool;
    beforeEach(() => {
      pool = new Pool();
      pool.pool_name = 'somePoolName';
      pool.type = 'replicated';
      pool.size = 3;
      pool.crush_rule = 'someRule';
      pool.pg_num = 32;
      pool.options = {};
      pool.options.compression_mode = 'passive';
      pool.options.compression_algorithm = 'lz4';
      pool.options.compression_min_blob_size = 1024 * 512;
      pool.options.compression_max_blob_size = 1024 * 1024;
      pool.options.compression_required_ratio = 0.8;
      pool.flags_names = 'someFlag1,someFlag2';
      pool.application_metadata = ['rbd', 'rgw'];
      createRule({ name: 'someRule' });
      const router = TestBed.get(Router);
      spyOnProperty(router, 'url', 'get').and.callFake(() => url);
      spyOn(component, 'initEditMode').and.callThrough();
      spyOn(poolService, 'get').and.callFake(() => Observable.of(pool));
    });

    it('should not call initEditMode if edit is not included in url', () => {
      url = '/pool/add';
      expect(component.initEditMode).not.toHaveBeenCalled();
      component.ngOnInit();
      expect(component.initEditMode).not.toHaveBeenCalled();
    });

    it('should call initEditMode if edit is included in url', () => {
      url = '/pool/edit/somePoolName';
      expect(component.initEditMode).not.toHaveBeenCalled();
      component.ngOnInit();
      expect(component.initEditMode).toHaveBeenCalled();
    });

    describe('after ngOnInit', () => {
      beforeEach(() => {
        spyOn(component, 'disableForEdit').and.callThrough();
        spyOn(component, 'initEditFormData').and.callThrough();
        spyOn(component, 'enableComplexValidators').and.callThrough();
        url = '/pool/edit/somePoolName';
        component.ngOnInit();
      });

      it('should set editing to true if initEditMode is called', () => {
        expect(component.editing).toBeTruthy();
      });

      it('should disable inputs', () => {
        expect(component.disableForEdit).toHaveBeenCalled();
        const disabled = [
          'name',
          'poolType',
          'crushRule',
          'size',
          'erasureProfile',
          'ecOverwrites'
        ];
        const enabled = _.difference(allControlNames, disabled);
        disabled.forEach((controlName) => {
          return expect(component.formGet(controlName).disabled).toBeTruthy(controlName);
        });
        enabled.forEach((controlName) => {
          return expect(component.formGet(controlName).enabled).toBeTruthy(controlName);
        });
      });

      it('should set control values', () => {
        expect(component.initEditFormData).toHaveBeenCalled();
        expect(component.isSet('name')).toBe(pool.pool_name);
        expect(component.isSet('poolType')).toBe(pool.type);
        expect(component.isSet('crushRule')).toEqual(component.info.crush_rules_replicated[0]);
        expect(component.isSet('size')).toBe(pool.size);
        expect(component.isSet('pgNum')).toBe(pool.pg_num);
        expect(component.isSet('mode')).toBe(pool.options.compression_mode);
        expect(component.isSet('algorithm')).toBe(pool.options.compression_algorithm);
        expect(component.isSet('minBlobSize')).toBe('512KiB');
        expect(component.isSet('maxBlobSize')).toBe('1MiB');
        expect(component.isSet('ratio')).toBe(pool.options.compression_required_ratio);
      });

      it('should only be possible to use the same or more pgs like before', () => {
        expect(component.enableComplexValidators).toHaveBeenCalled();
        isValid(setValue('pgNum', 64));
        hasError(setValue('pgNum', 4), 'noDecrease');
      });
    });
  });
});

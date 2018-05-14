import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { PoolService } from '../../../shared/api/pool.service';
import { NotificationType } from '../../../shared/enum/notification-type.enum';
import { CrushRule } from '../../../shared/models/crush-rule';
import { CrushStep } from '../../../shared/models/crush-step';
import { FinishedTask } from '../../../shared/models/finished-task';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import { FormatterService } from '../../../shared/services/formatter.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TaskManagerMessageService } from '../../../shared/services/task-manager-message.service';
import { TaskManagerService } from '../../../shared/services/task-manager.service';
import { ErasureCodeProfile } from '../erasure-code-profile/erasure-code-profile';
import { ErasureCodeProfileService } from '../erasure-code-profile/erasure-code-profile.service';
import { Pool } from '../pool';
import { PoolFormData } from './pool-form-data';
import { PoolFormInfo } from './pool-form-info';

@Component({
  selector: 'cd-pool-form',
  templateUrl: './pool-form.component.html',
  styleUrls: ['./pool-form.component.scss']
})
export class PoolFormComponent implements OnInit {
  poolForm: FormGroup;
  compressionForm: FormGroup;
  appForm: FormGroup;
  ecProfiles: ErasureCodeProfile[];
  info: PoolFormInfo;
  routeParamsSubscribe: any;
  editing = false;
  data = new PoolFormData;
  current = {
    rules: []
  };

  constructor(private dimlessBinaryPipe: DimlessBinaryPipe,
              private route: ActivatedRoute,
              private router: Router,
              private poolService: PoolService,
              private formatter: FormatterService,
              private notificationService: NotificationService,
              private taskManagerService: TaskManagerService,
              private taskManagerMessageService: TaskManagerMessageService,
              private ecpService: ErasureCodeProfileService) {
    this.createForm();
  }

  createForm() {
    this.compressionForm = new FormGroup({
      mode: new FormControl(''),
      algorithm: new FormControl(''),
      minBlobSize: new FormControl('', {
        updateOn: 'blur'
      }),
      maxBlobSize: new FormControl('', {
        updateOn: 'blur'
      }),
      ratio: new FormControl('', {
        updateOn: 'blur'
      })
    });
    this.appForm = new FormGroup({
      appSelection: new FormControl(''),
      customApp: new FormControl('', {
        validators: [
          Validators.pattern('[A-Za-z0-9_]+'),
          Validators.maxLength(128)
        ],
        updateOn: 'blur'
      }),
    });
    this.poolForm = new FormGroup({
      name: new FormControl('', {
        validators: [
          Validators.pattern('[A-Za-z0-9_-]+'),
          Validators.required,
          this.genericValidator('uniqueName', (value) =>
            this.info && this.info.pool_names.indexOf(value) !== -1)
        ]
      }),
      poolType: new FormControl('', {
        validators: [
          Validators.required
        ]
      }),
      crushRule: new FormControl(null, {
        validators: [
          this.genericValidator(
            'toFewOsds',
            (rule) => this.info && rule && this.info.osd_count < rule.min_size
          )
        ]
      }),
      size: new FormControl('', {
        updateOn: 'blur'
      }),
      erasureProfile: new FormControl(null),
      pgNum: new FormControl('', {
        validators: [
          Validators.required,
          Validators.min(1),
        ],
        updateOn: 'blur'
      }),
      ecOverwrites: new FormControl(false),
      compression: this.compressionForm,
      app: this.appForm
    }, this.genericValidator('poolForm', () => null));
  }

  genericValidator(name: string, fn: Function): ValidatorFn {
    return (control: AbstractControl): ({[key: string]: any}) => {
      const value = fn.call(this, control.value);
      if (value) {
        return {[name]: value};
      }
      return null;
    };
  }

  formGet(name): AbstractControl {
    return this.poolForm.get(name) ||
      this.compressionForm.get(name) ||
      this.appForm.get(name);
  }

  ngOnInit() {
    Observable.forkJoin(
      this.poolService.getInfo(),
      this.ecpService.getList()
    ).subscribe((data: [PoolFormInfo, ErasureCodeProfile[]]) => {
      this.initInfo(data[0]);
      this.initEcp(data[1]);
      if (this.router.url.startsWith('/pool/edit')) {
        this.initEditMode();
      }
      this.listenToChanges();
      this.enableComplexValidators();
    });
  }

  initInfo(info: PoolFormInfo) {
    info.compression_algorithms = info.compression_algorithms.filter(m => m.length > 0);
    this.info = info;
  }

  initEcp(ecProfiles: ErasureCodeProfile[]) {
    if (ecProfiles.length === 1) {
      const control = this.formGet('erasureProfile');
      control.setValue(ecProfiles[0]);
      control.disable();
    }
    this.ecProfiles = ecProfiles;
  }

  initEditMode() {
    this.editing = true;
    this.disableForEdit();
    this.routeParamsSubscribe = this.route.params.subscribe((param: {name: string}) =>
      this.poolService.get(param.name).subscribe((pool: Pool) => {
        this.data.pool = pool;
        this.initEditFormData(pool);
      })
    );
  }

  disableForEdit() {
    [
      'name', 'poolType', 'crushRule', 'size', 'erasureProfile', 'ecOverwrites'
    ].forEach(controlName => this.formGet(controlName).disable());
  }

  initEditFormData(pool: Pool) {
    const transform = {
      'name': 'pool_name',
      'poolType': 'type',
      'crushRule': (p) => this.info['crush_rules_' + p.type].find((rule: CrushRule) =>
        rule.rule_name === p.crush_rule),
      'size': 'size',
      'erasureProfile': (p) => this.ecProfiles.find(ecp => ecp.name === p.erasure_code_profile),
      'pgNum': 'pg_num',
      'ecOverwrites': (p) => p.flags_names.includes('ec_overwrites'),
      'mode': 'options.compression_mode',
      'algorithm': 'options.compression_algorithm',
      'minBlobSize': (p) => this.dimlessBinaryPipe.transform(p.options.compression_min_blob_size),
      'maxBlobSize': (p) => this.dimlessBinaryPipe.transform(p.options.compression_max_blob_size),
      'ratio': 'options.compression_required_ratio'
    };
    Object.keys(transform).forEach(key => {
      const attrib = transform[key];
      const value = _.isFunction(attrib) ? attrib(pool) : _.get(pool, attrib);
      if (!_.isUndefined(value) && value !== '') {
        this.silentSetValue(key, value);
      }
    });
    this.data.apps = pool.application_metadata;
  }

  listenToChanges() {
    this.formGet('pgNum').valueChanges.subscribe(pgs => {
      if (pgs !== this.data.pgs) {
        this.pgUpdate(pgs);
      }
    });
    this.formGet('customApp').valueChanges.subscribe(() => {
      const customApp = this.formGet('customApp');
      const value = customApp.value;
      if (customApp.valid && value !== '') {
        this.addApp(value);
      }
    });
    if (!this.editing) {
      this.formGet('poolType').valueChanges.subscribe((poolType) => {
        this.formGet('size').updateValueAndValidity();
        this.rulesChange();
        if (poolType === 'replicated') {
          this.replicatedRuleChange();
        }
        this.pgCalc();
      });
      this.formGet('crushRule').valueChanges.subscribe(() => {
        if (this.isSet('poolType') === 'replicated') {
          this.replicatedRuleChange();
        }
        this.pgCalc();
      });
      this.formGet('size').valueChanges.subscribe(() => {
        this.pgCalc();
      });
      this.formGet('erasureProfile').valueChanges.subscribe(() => {
        this.pgCalc();
      });
      this.formGet('mode').valueChanges.subscribe(() => {
        ['minBlobSize', 'maxBlobSize', 'ratio'].forEach(name =>
          this.formGet(name).updateValueAndValidity());
      });
    }
  }

  enableComplexValidators() {
    if (this.editing) {
      this.formGet('pgNum').setValidators(this.genericValidator(
        'noDecrease', (pgs) => this.data.pool && pgs < this.data.pool.pg_num
      ));
    } else {
      this.validatingIf('size',
        () => this.formGet('poolType').value === 'replicated',
        [
          this.genericValidator('min', value => this.isSet('size') && value < this.getMinSize()),
          this.genericValidator('max', value => this.isSet('size') && this.getMaxSize() < value)
        ]
      );
    }
    this.validatingIf('minBlobSize', this.activatedCompression, [
      Validators.min(0),
      this.genericValidator(
        'maximum', (size) => {
          const maxSize = this.isSet('maxBlobSize');
          return maxSize && this.formatter.toBytes(size) >= this.formatter.toBytes(maxSize);
        }
      )
    ]);
    this.validatingIf('maxBlobSize', this.activatedCompression, [
      Validators.min(0),
      this.genericValidator(
        'minimum', (size) => {
          const minSize = this.isSet('minBlobSize');
          return minSize && this.formatter.toBytes(size) <= this.formatter.toBytes(minSize);
        }
      )
    ]);
    this.validatingIf('ratio', this.activatedCompression, [
      Validators.min(0),
      Validators.max(1)
    ]);
  }

  validatingIf(name: string, condition: Function, validators: ValidatorFn[]) {
    this.formGet(name).setValidators((control: AbstractControl): ({[key: string]: any}) => {
      const value = condition.call(this);
      if (value) {
        return Validators.compose(validators)(control);
      }
      return null;
    });
  }

  activatedCompression() {
    return this.isSet('mode') && this.formGet('mode').value.toLowerCase() !== 'none';
  }

  isSet(name: string) {
    const value = this.formGet(name).value;
    return value !== '' && value;
  }

  describeCrushStep(step: CrushStep) {
    return [
      step.op.replace('_', ' '),
      step.item_name || '',
      step.type ? step.num + ' type ' + step.type : ''
    ].join(' ');
  }

  silentSetValue(name: string, value: any) {
    this.formGet(name).setValue(value, {emitEvent: false});
  }

  addApp(app?: string) {
    app = app ? app : this.formGet('appSelection').value;
    if (app !== '') {
      this.removeApp('');
    }
    const apps = this.data.apps;
    if (!_.isString(app) || apps.length === 4) {
      return;
    }
    this.data.apps = [app].concat(apps);
  }

  removeApp(app: string) {
    this.removeAppByIndex(this.data.apps.indexOf(app));
  }

  removeAppByIndex(i) {
    if (i !== -1) {
      this.data.apps.splice(i, 1);
    }
  }

  getAvailApps(): string[] {
    return ['cephfs', 'rbd', 'rgw'].filter(app => this.data.apps.indexOf(app) === -1);
  }

  pgKeyUp($e) {
    const key = $e.key;
    const increment = ['ArrowUp', '+'];
    const decrement = ['ArrowDown', '-'];
    let jump;
    if (increment.indexOf(key) !== -1) {
      jump = 1;
    } else if (decrement.indexOf(key) !== -1) {
      jump = -1;
    }
    if (_.isNumber(jump)) {
      this.pgUpdate(undefined, jump);
    }
  }

  pgUpdate(pgs?, jump?) {
    pgs = _.isNumber(pgs) ? pgs : this.formGet('pgNum').value;
    if (pgs < 1) {
      pgs = 1;
    }
    let power = Math.round(Math.log(pgs) / Math.log(2));
    if (_.isNumber(jump)) {
      power += jump;
    }
    if (power < 0) {
      power = 0;
    }
    pgs = Math.pow(2, power); // Set size the nearest accurate size.
    this.data.pgs = pgs;
    this.silentSetValue('pgNum', pgs);
  }

  pgCalc () {
    if (!this.info) {
      return;
    }
    let pgs = this.info.osd_count * 100;
    const type = this.formGet('poolType').value;
    const fc_ecp = this.formGet('erasureProfile');
    const ecp = fc_ecp.value;
    const fc_size = this.formGet('size');
    const size = fc_size.value;
    if (type === 'replicated' && fc_size.valid && size > 0) {
      pgs = pgs / size;
    } else if (type === 'erasure' && fc_ecp.valid && ecp) {
      pgs = pgs / (ecp.k + ecp.m);
    } else {
      return;
    }
    this.pgUpdate(pgs);
  }

  rulesChange() {
    const poolType = this.isSet('poolType');
    if (!poolType || !this.info) {
      this.current.rules = [];
      return;
    }
    const rules = this.info['crush_rules_' + poolType] || [];
    const control = this.formGet('crushRule');
    if (rules.length === 1) {
      control.setValue(rules[0]);
      control.disable();
    } else {
      control.setValue(null);
      control.enable();
    }
    this.current.rules = rules;
  }

  replicatedRuleChange() {
    if (this.isSet('poolType') !== 'replicated') {
      return;
    }
    const rule = this.isSet('crushRule');
    if (!rule) {
      return;
    }
    const control = this.formGet('size');
    let size = this.isSet('size') || 1;
    const min = this.getMinSize();
    const max = this.getMaxSize();
    if (size < min) {
      size = min;
    } else if (size > max) {
      size = max;
    }
    if (size !== control.value) {
      this.silentSetValue('size', size);
    }
  }

  getMaxSize(): number {
    if (!this.info || this.info.osd_count < 1) {
      return;
    }
    const osds: number = this.info.osd_count;
    if (this.isSet('crushRule')) {
      const max: number = this.formGet('crushRule').value.max_size;
      if (max < osds) {
        return max;
      }
    }
    return osds;
  }

  getMinSize(): number {
    if (!this.info || this.info.osd_count < 1) {
      return;
    }
    const rule = this.isSet('crushRule');
    if (rule) {
      return rule.min_size;
    }
    return 1;
  }

  submit() {
    this.removeApp('');
    const pool = {};
    this._extendByItemsForSubmit(pool, [
      {api: 'pool', name: 'name', edit: true},
      {api: 'pool_type', name: 'poolType'},
      {api: 'pg_num', name: 'pgNum', edit: true},
      this.isSet('poolType') === 'replicated'
        ? {api: 'size', name: 'size'}
        : {api: 'erasure_code_profile', name: 'erasureProfile', attr: 'name'},
      {api: 'rule_name', name: 'crushRule', attr: 'rule_name'}
    ]);
    if (this.info.is_all_bluestore) {
      this._extendByItemForSubmit(pool,
        {api: 'flags', name: 'ecOverwrites', fn: () => ['ec_overwrites']}
      );
      if (this.isSet('mode')) {
        this._extendByItemsForSubmit(pool, [
          {api: 'compression_mode', name: 'mode', edit: true},
          {api: 'compression_algorithm', name: 'algorithm', edit: true},
          {api: 'compression_min_blob_size', name: 'minBlobSize', fn: this.formatter.toBytes,
            edit: true},
          {api: 'compression_max_blob_size', name: 'maxBlobSize', fn: this.formatter.toBytes,
            edit: true},
          {api: 'compression_required_ratio', name: 'ratio', edit: true},
        ]);
      }
    }
    if (this.data.apps.length > 0 || this.editing) {
      pool['application_metadata'] = this.data.apps;
    }
    this.createAction(pool);
  }

  _extendByItemsForSubmit (pool, items: any[]) {
    items.forEach(item => this._extendByItemForSubmit(pool, item));
  }

  _extendByItemForSubmit (pool, {api, name, attr, fn, edit}:
      {api: string, name: string, attr?: string, fn?: Function, edit?: boolean}) {
    if (this.editing && !edit) {
      return;
    }
    let value = this.isSet(name);
    if (!value && value !== 0) {
      return;
    }
    if (fn) {
      value = fn(value);
    }
    pool[api] = fn ? fn(value) : (attr ? _.get(value, attr) : value);
  }

  createAction(pool) {
    const finishedTask = new FinishedTask();
    finishedTask.name = 'pool/' + this.editing ? 'update' : 'create' + ' ' + pool.pool;
    this.poolService[this.editing ? 'update' : 'create'](pool).toPromise().then((resp) => {
      if (resp.status === 202) {
        this.notificationService.show(NotificationType.info,
          'Pool ' + this.editing ? 'updating' : 'creation' + ' in progress...',
          this.taskManagerMessageService.getDescription(finishedTask));
        this.taskManagerService.subscribe(finishedTask.name, undefined,
          (asyncFinishedTask: FinishedTask) => {
            this.notificationService.notifyTask(asyncFinishedTask);
          });
      } else {
        finishedTask.success = true;
        this.notificationService.notifyTask(finishedTask);
      }
      this.router.navigate(['/pool']);
    }, (resp) => {
      this.poolForm.setErrors({'cdSubmitButton': true});
      finishedTask.success = false;
      finishedTask.exception = resp.error;
      this.notificationService.notifyTask(finishedTask);
    });
  }
}

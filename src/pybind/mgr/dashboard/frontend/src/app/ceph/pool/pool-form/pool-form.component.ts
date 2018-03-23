import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { PoolService } from '../../../shared/api/pool.service';
import { NotificationType } from '../../../shared/enum/notification-type.enum';
import { CrushStep } from '../../../shared/models/crush-step';
import { FinishedTask } from '../../../shared/models/finished-task';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import { FormatterService } from '../../../shared/services/formatter.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TaskManagerMessageService } from '../../../shared/services/task-manager-message.service';
import { TaskManagerService } from '../../../shared/services/task-manager.service';
import { ErasureCodeProfile } from '../erasure-code-profile/erasure-code-profile';
import { ErasureCodeProfileService } from '../erasure-code-profile/erasure-code-profile.service';
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
  data = {
    poolTypes: ['erasure', 'replicated'],
    apps: [],
    pgs: 1
  };
  current = {
    rules: []
  };

  constructor(private dimlessBinaryPipe: DimlessBinaryPipe,
              private router: Router,
              private poolService: PoolService,
              private formatter: FormatterService,
              private notificationService: NotificationService,
              private taskManagerService: TaskManagerService,
              private taskManagerMessageService: TaskManagerMessageService,
              private ecpService: ErasureCodeProfileService) {
    this.createForm();
    this.listenToChanges();
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

  listenToChanges() {
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
    this.formGet('mode').valueChanges.subscribe(() => {
      ['minBlobSize', 'maxBlobSize', 'ratio'].forEach(name =>
        this.formGet(name).updateValueAndValidity());
    });
  }

  formGet(name): AbstractControl {
    return this.poolForm.get(name) ||
      this.compressionForm.get(name) ||
      this.appForm.get(name);
  }

  ngOnInit() {
    this.poolService.getInfo().subscribe((data: any) => {
      this.info = data;
      this.info.compression_algorithms = this.info.compression_algorithms.filter(m => m.length > 0);
    });
    this.ecpService.getList().subscribe((ecProfiles: ErasureCodeProfile[]) => {
      if (ecProfiles.length === 1) {
        const control = this.formGet('erasureProfile');
        control.setValue(ecProfiles[0]);
        control.disable();
      }
      this.ecProfiles = ecProfiles;
    });
    this.validatingIf('size',
      () => this.formGet('poolType').value === 'replicated',
      [
        this.genericValidator('min', value => this.isSet('size') && value < this.getMinSize()),
        this.genericValidator('max', value => this.isSet('size') && this.getMaxSize() < value)
      ]
    );
    this.validatingIf('minBlobSize', this.activatedCompression, [
      Validators.min(0),
    ]);
    this.validatingIf('maxBlobSize', this.activatedCompression, [
      Validators.min(0),
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
    if (this.poolForm.invalid) {
      // this.formService.focusInvalid(this.el); <- not here yet
      console.log(this.poolForm, 'you shall not pass!');
      return;
    }
    this.removeApp('');
    const pool = {
      pool: this.formGet('name').value,
      pool_type: this.formGet('poolType').value,
      pg_num: this.formGet('pgNum').value
    };
    const extendPool = (controlName, apiName, attrPath?, value?) => {
      if (!this.isSet(controlName)) {
        return;
      }
      if (!value) {
        value = this.formGet(controlName).value;
        if (attrPath) {
          value = _.get(value, attrPath);
        }
      }
      pool[apiName] = value;
    };
    const extendPoolByBytes = (controlName, apiName) => {
      const value = this.isSet(controlName);
      if (!value) {
        return;
      }
      extendPool(controlName, apiName, undefined, this.formatter.toBytes(value));
    };
    if (pool.pool_type === 'replicated') {
      extendPool('size', 'size');
    } else {
      extendPool('erasureProfile', 'erasure_code_profile', 'name');
    }
    extendPool('crushRule', 'rule_name', 'rule_name');
    if (this.info.is_all_bluestore) {
      extendPool('ecOverwrites', 'flags', undefined, ['ec_overwrites']);
      if (this.isSet('mode')) {
        extendPool('mode', 'compression_mode');
        extendPool('algorithm', 'compression_algorithm');
        extendPoolByBytes('minBlobSize', 'compression_min_blob_size');
        extendPoolByBytes('maxBlobSize', 'compression_max_blob_size');
        extendPool('ratio', 'compression_required_ratio');
      }
    }
    if (this.data.apps.length > 0) {
      pool['application_metadata'] = this.data.apps;
    }
    this.createAction(pool);
  }

  createAction(pool) {
    const finishedTask = new FinishedTask();
    finishedTask.name = 'pool/create';
    finishedTask.metadata = {'pool_name': pool.pool};
    this.poolService.create(pool).toPromise().then((resp) => {
      if (resp.status === 202) {
        this.notificationService.show(NotificationType.info,
          `Pool creation in progress...`,
          this.taskManagerMessageService.getDescription(finishedTask));
        this.taskManagerService.subscribe(finishedTask.name, finishedTask.metadata,
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

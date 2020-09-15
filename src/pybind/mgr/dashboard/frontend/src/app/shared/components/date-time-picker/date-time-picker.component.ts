import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { NgbCalendar, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cd-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {
  @Input()
  control: FormControl;

  @Input()
  hasSeconds = true;

  @Input()
  hasTime = true;

  format: string;
  minDate: NgbDateStruct;
  date: NgbDateStruct;
  time: NgbTimeStruct;

  sub: Subscription;

  constructor(private calendar: NgbCalendar) {}

  ngOnInit() {
    this.minDate = this.calendar.getToday();
    if (!this.hasTime) {
      this.format = 'yyyy-MM-dd';
    } else if (this.hasSeconds) {
      this.format = 'yyyy-MM-dd HH:mm:ss';
    } else {
      this.format = 'yyyy-MM-dd HH:mm';
    }

    let mom = DateTime.fromFormat(this.control?.value || '', this.format);

    if (!mom.isValid || mom < DateTime.local()) {
      mom = DateTime.local();
    }

    this.date = { year: mom.year, month: mom.month, day: mom.day };
    this.time = { hour: mom.hour, minute: mom.minute, second: mom.second };

    this.onModelChange();
  }

  onModelChange() {
    if (this.date) {
      const datetime = Object.assign({}, this.date, this.time);
      setTimeout(() => {
        this.control.setValue(DateTime.fromObject(datetime).toFormat(this.format));
      });
    } else {
      setTimeout(() => {
        this.control.setValue('');
      });
    }
  }
}

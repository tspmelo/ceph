import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { NgbCalendar, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import {
  format,
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
  isValid,
  parse,
  parseISO
} from 'date-fns';
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
      this.format = 'YYYY-MM-dd';
    } else if (this.hasSeconds) {
      this.format = 'YYYY-MM-dd HH:mm:ss';
    } else {
      this.format = 'YYYY-MM-dd HH:mm';
    }

    let mom = parse(this.control?.value, this.format, new Date());

    if (!isValid(mom) || mom < new Date()) {
      mom = new Date();
    }

    this.date = { year: getYear(mom), month: getMonth(mom), day: getDate(mom) };
    this.time = { hour: getHours(mom), minute: getMinutes(mom), second: getSeconds(mom) };

    this.onModelChange();
  }

  onModelChange() {
    if (this.date) {
      // 2020-09-17T19:57:29Z
      const datetime = `${this.date.year}-${this.date.month}-${this.date.day}T${this.time.hour}:${this.time.minute}:${this.time.second}Z`;
      setTimeout(() => {
        this.control.setValue(format(parseISO(datetime), this.format));
      });
    } else {
      setTimeout(() => {
        this.control.setValue('');
      });
    }
  }
}

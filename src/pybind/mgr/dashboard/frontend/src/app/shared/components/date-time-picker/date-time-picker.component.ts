import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { NgbCalendar, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { Subscription } from 'rxjs';

dayjs.extend(objectSupport);

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
      this.format = 'YYYY-MM-DD';
    } else if (this.hasSeconds) {
      this.format = 'YYYY-MM-DD HH:mm:ss';
    } else {
      this.format = 'YYYY-MM-DD HH:mm';
    }

    let mom = dayjs(this.control?.value, this.format);

    if (!mom.isValid() || mom.isBefore(dayjs())) {
      mom = dayjs();
    }

    this.date = { year: mom.year(), month: mom.month() + 1, day: mom.date() };
    this.time = { hour: mom.hour(), minute: mom.minute(), second: mom.second() };

    this.onModelChange();
  }

  onModelChange() {
    if (this.date) {
      const datetime = Object.assign({}, this.date, this.time);
      datetime.month--;
      setTimeout(() => {
        this.control.setValue(dayjs(datetime).format(this.format));
      });
    } else {
      setTimeout(() => {
        this.control.setValue('');
      });
    }
  }
}

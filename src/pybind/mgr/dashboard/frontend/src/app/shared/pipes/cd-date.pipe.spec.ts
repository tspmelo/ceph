import { DatePipe } from '@angular/common';

import { DateTime } from 'luxon';

import { CdDatePipe } from './cd-date.pipe';

describe('CdDatePipe', () => {
  const datePipe = new DatePipe('en-US');
  let pipe = new CdDatePipe(datePipe);

  it('create an instance', () => {
    pipe = new CdDatePipe(datePipe);
    expect(pipe).toBeTruthy();
  });

  it('transforms without value', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('transforms with some date', () => {
    const result = DateTime.fromMillis(1527085564486).toFormat('M/d/yy tt');
    expect(pipe.transform(1527085564486)).toBe(result);
  });
});

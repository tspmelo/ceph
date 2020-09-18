import { DatePipe } from '@angular/common';

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
    expect(pipe.transform(1527085564486)).toBe('5/23/18 2:26:04 PM');
  });
});

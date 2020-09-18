import { sub } from 'date-fns';

import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms seconds into a human readable duration', () => {
    expect(pipe.transform(0)).toBe('1 second');
    expect(pipe.transform(6)).toBe('6 seconds');
    expect(pipe.transform(60)).toBe('1 minute');
    expect(pipe.transform(600)).toBe('10 minutes');
    expect(pipe.transform(6000)).toBe('1 hour 40 minutes');
  });

  it('transforms date into a human readable relative duration', () => {
    const date = sub(new Date(), { seconds: 130 });
    expect(pipe.transform(date, true)).toBe('2 minutes ago');
  });
});

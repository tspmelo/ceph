import dayjs from 'dayjs';

import { RelativeDatePipe } from './relative-date.pipe';

describe('RelativeDatePipe', () => {
  const pipe = new RelativeDatePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms without value', () => {
    expect(pipe.transform(undefined)).toBe('unknown');
  });

  it('transforms "in 7 days"', () => {
    const value = dayjs().add(7, 'day').unix();
    expect(pipe.transform(value)).toBe('in 7 days');
  });

  it('transforms "7 days ago"', () => {
    const value = dayjs().subtract(7, 'day').unix();
    expect(pipe.transform(value)).toBe('7 days ago');
  });
});

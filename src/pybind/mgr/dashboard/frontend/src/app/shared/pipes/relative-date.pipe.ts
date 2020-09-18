import { Pipe, PipeTransform } from '@angular/core';

import { formatDistance, fromUnixTime } from 'date-fns';

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return 'unknown';
    }
    return formatDistance(fromUnixTime(value), new Date());
  }
}

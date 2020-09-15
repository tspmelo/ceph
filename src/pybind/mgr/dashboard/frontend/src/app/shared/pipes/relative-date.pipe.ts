import { Pipe, PipeTransform } from '@angular/core';

import { DateTime } from 'luxon';

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return 'unknown';
    }
    return DateTime.fromSeconds(value).toRelative({ padding: 1000 });
  }
}

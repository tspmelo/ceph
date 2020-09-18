import { Pipe, PipeTransform } from '@angular/core';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime)

@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return 'unknown';
    }
    return dayjs(value * 1000).fromNow();
  }
}

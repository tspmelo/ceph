import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monSummary'
})
export class MonSummaryPipe implements PipeTransform {
  transform(mon_status: any, args?: any): any {
    let result = mon_status.monmap.mons.length.toString() + ' (quorum ';
    result += mon_status.quorum.join(', ');
    result += ')';

    return result;
  }
}

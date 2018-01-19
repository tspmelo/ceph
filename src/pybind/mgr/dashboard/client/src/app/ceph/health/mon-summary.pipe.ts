import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monSummary'
})
export class MonSummaryPipe implements PipeTransform {
  transform(monStatus: any, args?: any): any {
    let result = monStatus.monmap.mons.length.toString() + ' (quorum ';
    result += monStatus.quorum.join(', ');
    result += ')';

    return result;
  }
}

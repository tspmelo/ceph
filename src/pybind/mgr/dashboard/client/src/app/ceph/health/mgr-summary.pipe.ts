import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mgrSummary'
})
export class MgrSummaryPipe implements PipeTransform {
  transform(mgrMap: any, args?: any): any {
    let result = '';
    result += 'active: ' + mgrMap.active_name;
    if (mgrMap.standbys.length) {
      result += ', ' + mgrMap.standbys.length + ' standbys';
    }

    return result;
  }
}

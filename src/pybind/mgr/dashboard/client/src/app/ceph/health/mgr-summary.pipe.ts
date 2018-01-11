import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mgrSummary'
})
export class MgrSummaryPipe implements PipeTransform {
  transform(mgr_map: any, args?: any): any {
    let result = '';
    result += 'active: ' + mgr_map.active_name;
    if (mgr_map.standbys.length) {
      result += ', ' + mgr_map.standbys.length + ' standbys';
    }

    return result;
  }
}

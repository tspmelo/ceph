import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';

@Pipe({
  name: 'osdSummary'
})
export class OsdSummaryPipe implements PipeTransform {
  transform(osd_map: any, args?: any): any {
    let in_count = 0;
    let up_count = 0;
    _.each(osd_map.osds, function(osd, i) {
      // TODO: test
      if (osd.in) {
        in_count++;
      }
      if (osd.up) {
        up_count++;
      }
    });

    return osd_map.osds.length + ' (' + up_count + ' up, ' + in_count + ' in)';
  }
}

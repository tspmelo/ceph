import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';

@Pipe({
  name: 'osdSummary'
})
export class OsdSummaryPipe implements PipeTransform {
  transform(osdMap: any, args?: any): any {
    let inCount = 0;
    let upCount = 0;
    _.each(osdMap.osds, function(osd, i) {
      // TODO: test
      if (osd.in) {
        inCount++;
      }
      if (osd.up) {
        upCount++;
      }
    });

    return osdMap.osds.length + ' (' + upCount + ' up, ' + inCount + ' in)';
  }
}

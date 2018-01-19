import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';

@Pipe({
  name: 'mdsSummary'
})
export class MdsSummaryPipe implements PipeTransform {
  transform(fsMap: any, args?: any): any {
    let standbys = 0;
    let active = 0;
    let standbyReplay = 0;
    _.each(fsMap.standbys, (s, i) => {
      standbys += 1;
    });

    if (fsMap.standbys && !fsMap.filesystems) {
      return standbys + ', no filesystems';
    } else if (fsMap.filesystems.length === 0) {
      return 'no filesystems';
    } else {
      _.each(fsMap.filesystems, function(fs, i) {
        _.each(fs.mdsmap.info, function(mds, j) {
          if (mds.state === 'up:standby-replay') {
            standbyReplay += 1;
          } else {
            active += 1;
          }
        });
      });

      return active + ' active, ' + (standbys + standbyReplay) + ' standby';
    }
  }
}

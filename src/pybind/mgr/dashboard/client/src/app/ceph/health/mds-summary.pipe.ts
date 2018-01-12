import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';

@Pipe({
  name: 'mdsSummary'
})
export class MdsSummaryPipe implements PipeTransform {
  transform(fs_map: any, args?: any): any {
    let standbys = 0;
    let active = 0;
    let standby_replay = 0;
    _.each(fs_map.standbys, (s, i) => {
      standbys += 1;
    });

    if (fs_map.standbys && !fs_map.filesystems) {
      return standbys + ', no filesystems';
    } else if (fs_map.filesystems.length === 0) {
      return 'no filesystems';
    } else {
      _.each(fs_map.filesystems, function(fs, i) {
        _.each(fs.mdsmap.info, function(mds, j) {
          if (mds.state === 'up:standby-replay') {
            standby_replay += 1;
          } else {
            active += 1;
          }
        });
      });

      return active + ' active, ' + (standbys + standby_replay) + ' standby';
    }
  }
}

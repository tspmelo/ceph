import { Component, Input, OnChanges, OnDestroy } from '@angular/core';

import * as _ from 'lodash';

import { OsdService } from '../../../../shared/api/osd.service';
import { CdTableSelection } from '../../../../shared/models/cd-table-selection';

@Component({
  selector: 'cd-osd-details',
  templateUrl: './osd-details.component.html',
  styleUrls: ['./osd-details.component.scss']
})
export class OsdDetailsComponent implements OnChanges, OnDestroy {
  @Input() selection: CdTableSelection;

  osd: any;
  tab = 'Attributes';
  interval: any;

  constructor(private osdService: OsdService) {}

  ngOnChanges() {
    this.osd = {
      loaded: false
    };
    if (this.selection.hasSelection) {
      this.osd = this.selection.first();
      this.refresh();
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.refresh();
      }, 5000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  refresh() {
    this.osdService.getDetails(this.osd.tree.id).subscribe((data: any) => {
      this.osd.details = data;
      if (!_.isObject(data.histogram)) {
        this.osd.histogram_failed = data.histogram;
        this.osd.details.histogram = undefined;
      }
      this.osd.loaded = true;
    });
  }
}

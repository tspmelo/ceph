import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-osd',
  templateUrl: './osd.component.html',
  styleUrls: ['./osd.component.scss']
})
export class OsdComponent implements OnInit {

  osdsByServer = [];
  wj: any = window;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.http.get('/osd/list_data').subscribe((data: Array<any>) => {
      // TODO limit max size??
      _.extend(this.osdsByServer, data);
      setTimeout(() => {
        // TODO set values by argument e.g. [10,8,5,7,4,4,1]
        this.wj.$('.inlinesparkline').sparkline();
      });
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

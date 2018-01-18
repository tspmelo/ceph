import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-mirroring',
  templateUrl: './mirroring.component.html',
  styleUrls: ['./mirroring.component.scss']
})
export class MirroringComponent implements OnInit {
  contentData: any;
  wj: any = window;

  constructor(private http: HttpClient) {
    this.contentData = {};
  }

  refresh() {
    this.http.get('/rbd_mirroring_data').subscribe(data => {
      _.extend(this.contentData, data);
      setTimeout(() => {
        this.refresh();
      }, 30000);
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.refresh();
    }, 30000);

    let tableIds = ['daemons', 'pools'];
    for (let i = 0; i < tableIds.length; ++i) {
      this.wj.$('#' + tableIds[i]).DataTable({
        paging: true,
        pageLength: 5,
        lengthChange: false,
        info: false,
        autoWidth: false,
        searching: false
      });
    }

    tableIds = ['image_errors', 'image_syncing', 'image_ready'];
    for (let i = 0; i < tableIds.length; ++i) {
      this.wj.$('#' + tableIds[i]).DataTable({
        paging: true,
        pageLength: 10,
        lengthChange: false,
        searching: true,
        ordering: true,
        info: false
      });
    }
  }
}

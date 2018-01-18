import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-iscsi',
  templateUrl: './iscsi.component.html',
  styleUrls: ['./iscsi.component.scss']
})
export class IscsiComponent implements OnInit {
  contentData: any;
  wj: any = window;

  constructor(private http: HttpClient) {
    this.contentData = {};
  }

  refresh() {
    this.http.get('/rbd_iscsi_data').subscribe(data => {
      _.extend(this.contentData, data);
      this.wj.$('.inlinesparkline').sparkline();
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }

  ngOnInit() {
    this.wj.$('.inlinesparkline').sparkline();
    setTimeout(() => {
      this.refresh();
    }, 5000);

    this.wj.$('#daemons').DataTable({
      paging: true,
      pageLength: 5,
      lengthChange: false,
      info: false,
      autoWidth: false,
      searching: false
    });

    this.wj.$('#images').DataTable({
      paging: true,
      pageLength: 10,
      lengthChange: false,
      searching: true,
      ordering: true,
      info: false
    });
  }
}

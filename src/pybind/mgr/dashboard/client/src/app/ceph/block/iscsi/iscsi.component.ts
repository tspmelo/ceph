import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-iscsi',
  templateUrl: './iscsi.component.html',
  styleUrls: ['./iscsi.component.scss']
})
export class IscsiComponent implements OnInit {
  content_data: any;
  $: any;

  constructor(private http: HttpClient) {
    this.content_data = {};
  }

  refresh() {
    this.http.get('/rbd_iscsi_data').subscribe(data => {
      _.extend(this.content_data, data);
      $('.inlinesparkline').sparkline();
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }

  ngOnInit() {
    $('.inlinesparkline').sparkline();
    setTimeout(() => {
      this.refresh();
    }, 5000);

    $('#daemons').DataTable({
      paging: true,
      pageLength: 5,
      lengthChange: false,
      info: false,
      autoWidth: false,
      searching: false
    });

    $('#images').DataTable({
      paging: true,
      pageLength: 10,
      lengthChange: false,
      searching: true,
      ordering: true,
      info: false
    });
  }
}

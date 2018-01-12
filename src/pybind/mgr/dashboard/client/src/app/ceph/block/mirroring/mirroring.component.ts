import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-mirroring',
  templateUrl: './mirroring.component.html',
  styleUrls: ['./mirroring.component.scss']
})
export class MirroringComponent implements OnInit {
  content_data: any;
  $: any;

  constructor(private http: HttpClient) {
    this.content_data = {};
  }

  refresh() {
    this.http.get('/rbd_mirroring_data').subscribe(data => {
      _.extend(this.content_data, data);
      setTimeout(() => {
        this.refresh();
      }, 30000);
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.refresh();
    }, 30000);

    let table_ids = ['daemons', 'pools'];
    for (let i = 0; i < table_ids.length; ++i) {
      $('#' + table_ids[i]).DataTable({
        paging: true,
        pageLength: 5,
        lengthChange: false,
        info: false,
        autoWidth: false,
        searching: false
      });
    }

    table_ids = ['image_errors', 'image_syncing', 'image_ready'];
    for (let i = 0; i < table_ids.length; ++i) {
      $('#' + table_ids[i]).DataTable({
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

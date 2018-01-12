import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  toplevel_data: any;
  ceph_version: string;

  constructor(private http: HttpClient) {
    this.toplevel_data = {
      rbd_mirroring: {
        errors: 0
      },
      rbd_pools: [],
      filesystems: []
    };
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.http.get('/toplevel_data').subscribe(data => {
      _.extend(this.toplevel_data, data);
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

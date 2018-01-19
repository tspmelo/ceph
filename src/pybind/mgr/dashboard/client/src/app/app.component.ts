import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  toplevelData: any;
  cephVersion: string;
  rbdPools: any;

  constructor(private http: HttpClient) {
    this.toplevelData = {
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
      _.extend(this.toplevelData, data);
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });

    // Temporary fix. toplevel_data was not returning the list of pools
    this.http.get('/health_data').subscribe((data: any) => {
      this.rbdPools = data.pools;
    });
  }
}

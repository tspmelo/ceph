import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss']
})
export class PoolComponent implements OnInit {
  contentData: any;
  wj: any = window;
  poolName: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.contentData = {};
  }

  ngOnInit() {
    this.poolName = this.route.snapshot.paramMap.get('name');
    this.refresh();

    this.wj.$('#images').DataTable({
      paging: true,
      pageLength: 15,
      lengthChange: false,
      searching: true,
      ordering: true,
      info: false,
      autoWidth: false
    });
  }

  refresh() {
    this.http
      .get('/rbd_pool_data/' + this.poolName + '/')
      .subscribe(data => {
        this.contentData.images = data;
        setTimeout(() => {
          this.refresh();
        }, 10000);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss']
})
export class PoolComponent implements OnInit {
  content_data: any;
  wj: any = window;
  pool_name: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.content_data = {};
  }

  ngOnInit() {
    this.pool_name = +this.route.snapshot.paramMap.get('id');
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
      .get('/rbd_pool_data/' + this.pool_name + '/')
      .subscribe(data => {
        this.content_data.images = data;
        setTimeout(() => {
          this.refresh();
        }, 10000);
      });
  }
}

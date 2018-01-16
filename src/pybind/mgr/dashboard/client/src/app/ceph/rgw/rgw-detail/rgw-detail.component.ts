import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-rgw-detail',
  templateUrl: './rgw-detail.component.html',
  styleUrls: ['./rgw-detail.component.scss']
})
export class RgwDetailComponent implements OnInit {
  content_data: any;
  rgw_id: number;
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.rgw_id = +this.route.snapshot.paramMap.get('id');
    this.refresh();
  }

  refresh() {
    this.http.get('/rgw/rgw_data/' + this.rgw_id + '/').subscribe(data => {
      this.content_data = data;
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

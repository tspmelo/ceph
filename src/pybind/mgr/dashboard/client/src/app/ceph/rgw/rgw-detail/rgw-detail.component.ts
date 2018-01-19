import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cd-rgw-detail',
  templateUrl: './rgw-detail.component.html',
  styleUrls: ['./rgw-detail.component.scss']
})
export class RgwDetailComponent implements OnInit {
  contentData: any;
  rgwId: number;
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.rgwId = +this.route.snapshot.paramMap.get('id');
    this.refresh();
  }

  refresh() {
    this.http.get('/rgw/rgw_data/' + this.rgwId + '/').subscribe(data => {
      this.contentData = data;
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

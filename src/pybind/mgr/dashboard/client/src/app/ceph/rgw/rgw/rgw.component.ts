import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'cd-rgw',
  templateUrl: './rgw.component.html',
  styleUrls: ['./rgw.component.scss']
})
export class RgwComponent implements OnInit {
  content_data: any = {
    rgw: {}
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.http.get('/rgw/rgw_daemons_data').subscribe(data => {
      this.content_data = data;
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'cd-monitors',
  templateUrl: './monitors.component.html',
  styleUrls: ['./monitors.component.scss']
})
export class MonitorsComponent implements OnInit {
  content_data: any;
  wj: any = window;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Pre-populated initial data at page load
    this.refresh();
    this.wj.$('.inlinesparkline').sparkline();
  }

  refresh() {
    this.http.get('/monitors_data').subscribe(data => {
      this.content_data = data;
      setTimeout(() => {
        this.wj.$('.inlinesparkline').sparkline();
      },  0);
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }
}

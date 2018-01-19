import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'underscore';

@Component({
  selector: 'cd-osd-detail',
  templateUrl: './osd-detail.component.html',
  styleUrls: ['./osd-detail.component.scss']
})
export class OsdDetailComponent implements OnInit {
  osdId: number;
  opWLatencyInBytesHistogram = {};
  opRLatencyOutBytesHistogram = {};
  osd = {};
  osdList = [];
  osdMetadataList = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    this.osdId = +this.route.snapshot.paramMap.get('id');
    this.refresh();
  }

  refresh() {
    this.http.get(`/osd/perf_data/${this.osdId}`).subscribe((data: any) => {
      this.opWLatencyInBytesHistogram = data.osd_histogram.osd.op_w_latency_in_bytes_histogram;
      this.opRLatencyOutBytesHistogram = data.osd_histogram.osd.op_r_latency_out_bytes_histogram;
      this.osd = data.osd;
      const osdMetadata = data.osd_metadata;
      this.osdMetadataList = [];
      this.osdList = [];
      _.each(osdMetadata, (v, k) => {
        this.osdMetadataList.push({
          key: k,
          value: v
        });
      });
      _.each(this.osd, (v, k) => {
          this.osdList.push({
              key: k,
              value: v
          });
      });
      setTimeout(() => {
        this.refresh();
      }, 3000);
    });
  }

}

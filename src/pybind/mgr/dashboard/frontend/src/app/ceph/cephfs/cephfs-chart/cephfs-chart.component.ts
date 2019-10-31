import { Component, Input, OnChanges, OnInit } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';
import { ApexAxisChartSeries, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'cd-cephfs-chart',
  templateUrl: './cephfs-chart.component.html',
  styleUrls: ['./cephfs-chart.component.scss']
})
export class CephfsChartComponent implements OnChanges, OnInit {
  @Input()
  mdsCounter: any;

  lhsCounter = 'mds_mem.ino';
  rhsCounter = 'mds_server.handle_client_request';

  options = {
    chart: {
      height: 500,
      type: 'line'
    },
    stroke: {
      curve: 'smooth'
    },
    series: [
      {
        name: this.lhsCounter,
        type: 'area',
        data: []
      },
      {
        name: this.rhsCounter,
        type: 'line',
        data: []
      }
    ],
    fill: {
      type: 'solid',
      opacity: [0.35, 1]
    },
    markers: {
      size: 0
    },
    xaxis: {
      labels: {
        formatter: function(value) {
          return moment(value).format('HH:mm:ss');
        }
      }
    },
    yaxis: [
      {
        title: {
          text: this.lhsCounter
        }
      },
      {
        opposite: true,
        title: {
          text: this.rhsCounter
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false
    }
  };

  constructor() {}

  ngOnInit() {
    if (_.isUndefined(this.mdsCounter)) {
      return;
    }
    this.updateChart();
  }

  ngOnChanges() {
    if (_.isUndefined(this.mdsCounter)) {
      return;
    }
    this.updateChart();
  }

  private updateChart() {
    const chartDataSets = [
      {
        data: this.convertTimeSeries(this.mdsCounter[this.lhsCounter])
      },
      {
        data: this.deltaTimeSeries(this.mdsCounter[this.rhsCounter])
      }
    ];
    _.merge(this.options.series, chartDataSets);
    this.options.series = [...this.options.series]; // Force angular to update
  }

  /**
   * Convert ceph-mgr's time series format (list of 2-tuples
   * with seconds-since-epoch timestamps) into what chart.js
   * can handle (list of objects with millisecs-since-epoch
   * timestamps)
   */
  private convertTimeSeries(sourceSeries) {
    const data = [];
    _.each(sourceSeries, (dp) => {
      data.push({
        x: dp[0] * 1000,
        y: dp[1]
      });
    });
    data.shift();
    return data;
  }

  private deltaTimeSeries(sourceSeries) {
    let i;
    let prev = sourceSeries[0];
    const result = [];
    for (i = 1; i < sourceSeries.length; i++) {
      const cur = sourceSeries[i];
      const tdelta = cur[0] - prev[0];
      const vdelta = cur[1] - prev[1];
      const rate = vdelta / tdelta;

      result.push({
        x: cur[0] * 1000,
        y: rate
      });

      prev = cur;
    }
    return result;
  }
}

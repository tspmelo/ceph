import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';

@Component({
  selector: 'cd-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.scss']
})
export class FilesystemComponent implements OnInit {
  id: number;
  wj: any = window;
  ready = false;
  contentData: any = {
    filesystem: {}
  };

  lhsCounter = 'mds.inodes';
  rhsCounter = 'mds_server.handle_client_request';
  charts = {};

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');

    // TODO periodic refresh
    this.draw_chart();
    this.refresh();
  }

  refresh() {
    this.http.get('/filesystem_data/' + this.id + '/').subscribe(data => {
      this.ready = true;
      this.contentData = data;
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }

  draw_chart() {
    this.http.get('/mds_counters/' + this.id + '/').subscribe(data => {
      let topChart = true;

      // Cull any chart elements that correspond to MDSs no
      // longer present in the data
      const existingMdsNames = {};
      _.each(data, (mdsData, mdsName) => {
        existingMdsNames[mdsName] = true;
      });

      this.wj.$('#mds_charts canvas').each((i, e) => {
        const elMdsName = e.id.replace('mds_chart_', '');
        if (existingMdsNames[elMdsName] !== true) {
          e.remove();
        }
      });

      _.each(data, (mdsData, mdsName) => {
        if (!this.wj.$('#mds_chart_' + mdsName).length) {
          // Construct new chart
          this.wj
            .$('#mds_charts')
            .append(
              this.wj.$(
                '<canvas height=\'64\' id=\'mds_chart_' + mdsName + '\'></canvas>'
              )
            );

          const ctx = this.wj.$('#mds_chart_' + mdsName);
          const lhsData = this.convert_timeseries(mdsData[this.lhsCounter]);
          const rhsData = this.delta_timeseries(mdsData[this.rhsCounter]);

          const chartInstance = new this.wj.Chart(ctx, {
            type: 'line',
            data: {
              datasets: [
                {
                  label: this.lhsCounter,
                  yAxisID: 'LHS',
                  data: lhsData,
                  tension: 0.1,
                  borderColor: '#dd2222'
                },
                {
                  label: this.rhsCounter,
                  yAxisID: 'RHS',
                  data: rhsData,
                  tension: 0.1,
                  borderColor: '#2222dd'
                }
              ]
            },
            options: {
              legend: {
                position: 'top',
                display: topChart,
                labels: { fontColor: '#ddd' }
              },
              scales: {
                xAxes: [
                  {
                    position: 'top',
                    type: 'time',
                    display: topChart,
                    ticks: { fontColor: '#ddd' },
                    time: {
                      displayFormats: {
                        quarter: 'MMM YYYY'
                      }
                    }
                  }
                ],
                yAxes: [
                  {
                    id: 'LHS',
                    type: 'linear',
                    position: 'left',
                    ticks: { fontColor: '#ddd' },
                    min: 0
                  },
                  {
                    id: 'RHS',
                    type: 'linear',
                    position: 'right',
                    ticks: { fontColor: '#ddd' },
                    min: 0
                  }
                ]
              }
            }
          });
          this.charts[mdsName] = chartInstance;
        } else {
          // Update existing chart
          const chart = this.charts[mdsName];
          const lhsData = this.convert_timeseries(mdsData[this.lhsCounter]);
          const rhsData = this.delta_timeseries(mdsData[this.rhsCounter]);
          chart.data.datasets[0].data = lhsData;
          chart.data.datasets[1].data = rhsData;
          chart.update(0);
        }

        // FIXME: update the visibility of axes etc
        // when charts come and go.
        topChart = false;
      });

      setTimeout(() => {
        this.draw_chart();
      }, 5000);
    });
  }

  // Convert ceph-mgr's time series format (list of 2-tuples
  // with seconds-since-epoch timestamps) into what chart.js
  // can handle (list of objects with millisecs-since-epoch
  // timestamps)
  convert_timeseries(sourceSeries) {
    const data = [];
    _.each(sourceSeries, dp => {
      data.push({
        x: dp[0] * 1000,
        y: dp[1]
      });
    });

    return data;
  }

  delta_timeseries(sourceSeries) {
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

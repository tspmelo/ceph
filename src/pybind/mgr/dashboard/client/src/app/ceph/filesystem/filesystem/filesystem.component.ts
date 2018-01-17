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
  content_data: any = {
    filesystem: {}
  };

  lhs_counter = 'mds.inodes';
  rhs_counter = 'mds_server.handle_client_request';
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
      this.content_data = data;
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }

  draw_chart() {
    this.http.get('/mds_counters/' + this.id + '/').subscribe(data => {
      let top_chart = true;

      // Cull any chart elements that correspond to MDSs no
      // longer present in the data
      const existing_mds_names = {};
      _.each(data, (mds_data, mds_name) => {
        existing_mds_names[mds_name] = true;
      });

      this.wj.$('#mds_charts canvas').each((i, e) => {
        const el_mds_name = e.id.replace('mds_chart_', '');
        if (existing_mds_names[el_mds_name] !== true) {
          e.remove();
        }
      });

      _.each(data, (mds_data, mds_name) => {
        if (!this.wj.$('#mds_chart_' + mds_name).length) {
          // Construct new chart
          this.wj
            .$('#mds_charts')
            .append(
              this.wj.$(
                '<canvas height=\'64\' id=\'mds_chart_' + mds_name + '\'></canvas>'
              )
            );

          const ctx = this.wj.$('#mds_chart_' + mds_name);
          const lhs_data = this.convert_timeseries(mds_data[this.lhs_counter]);
          const rhs_data = this.delta_timeseries(mds_data[this.rhs_counter]);

          const chartInstance = new this.wj.Chart(ctx, {
            type: 'line',
            data: {
              datasets: [
                {
                  label: this.lhs_counter,
                  yAxisID: 'LHS',
                  data: lhs_data,
                  tension: 0.1,
                  borderColor: '#dd2222'
                },
                {
                  label: this.rhs_counter,
                  yAxisID: 'RHS',
                  data: rhs_data,
                  tension: 0.1,
                  borderColor: '#2222dd'
                }
              ]
            },
            options: {
              legend: {
                position: 'top',
                display: top_chart,
                labels: { fontColor: '#ddd' }
              },
              scales: {
                xAxes: [
                  {
                    position: 'top',
                    type: 'time',
                    display: top_chart,
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
          this.charts[mds_name] = chartInstance;
        } else {
          // Update existing chart
          const chart = this.charts[mds_name];
          const lhs_data = this.convert_timeseries(mds_data[this.lhs_counter]);
          const rhs_data = this.delta_timeseries(mds_data[this.rhs_counter]);
          chart.data.datasets[0].data = lhs_data;
          chart.data.datasets[1].data = rhs_data;
          chart.update(0);
        }

        // FIXME: update the visibility of axes etc
        // when charts come and go.
        top_chart = false;
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
  convert_timeseries(source_series) {
    const data = [];
    _.each(source_series, dp => {
      data.push({
        x: dp[0] * 1000,
        y: dp[1]
      });
    });

    return data;
  }

  delta_timeseries(source_series) {
    let i;
    let prev = source_series[0];
    const result = [];
    for (i = 1; i < source_series.length; i++) {
      const cur = source_series[i];
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

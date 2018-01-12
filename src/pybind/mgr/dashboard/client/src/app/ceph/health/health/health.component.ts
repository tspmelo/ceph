import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import * as Chart from 'chart.js';

@Component({
  selector: 'cd-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {
  content_data: any;
  poolUsage: any = {
    chartType: 'doughnut'
  };
  rawUsage: any = {
    chartType: 'doughnut'
  };
  isReady: boolean;

  constructor(
    private http: HttpClient,
    private dimlessBinary: DimlessBinaryPipe
  ) {
    this.isReady = false;
    this.content_data = {};
  }

  ngOnInit() {
    // An extension to Chart.js to enable rendering some
    // text in the middle of a doughnut
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        if (!chart.options.center_text) {
          return;
        }
        const width = chart.chart.width,
          height = chart.chart.height,
          ctx = chart.chart.ctx;

        ctx.restore();
        const fontSize = (height / 114).toFixed(2);
        ctx.font = fontSize + 'em sans-serif';
        ctx.fillStyle = '#ddd';
        ctx.textBaseline = 'middle';

        const text = chart.options.center_text,
          textX = Math.round((width - ctx.measureText(text).width) / 2),
          textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    });
    this.refresh();
  }

  refresh() {
    this.http.get('/health_data').subscribe(data => {
      _.extend(this.content_data, data);
      this.isReady = true;
      this.draw_usage_charts();
      setTimeout(() => {
        this.refresh();
      }, 5000);
    });
  }

  draw_usage_charts() {
    let raw_usage_chart_color;
    const raw_usage_text =
      Math.round(
        100 *
          (this.content_data.df.stats.total_used_bytes /
            this.content_data.df.stats.total_bytes)
      ) + '%';
    if (
      this.content_data.df.stats.total_used_bytes /
        this.content_data.df.stats.total_bytes >=
      this.content_data.osd_map.full_ratio
    ) {
      raw_usage_chart_color = '#ff0000';
    } else if (
      this.content_data.df.stats.total_used_bytes /
        this.content_data.df.stats.total_bytes >=
      this.content_data.osd_map.backfillfull_ratio
    ) {
      raw_usage_chart_color = '#ff6600';
    } else if (
      this.content_data.df.stats.total_used_bytes /
        this.content_data.df.stats.total_bytes >=
      this.content_data.osd_map.nearfull_ratio
    ) {
      raw_usage_chart_color = '#ffc200';
    } else {
      raw_usage_chart_color = '#00bb00';
    }

    this.rawUsage = {
      chartType: 'doughnut',
      dataset: [
        {
          label: null,
          borderWidth: 0,
          data: [
            this.content_data.df.stats.total_used_bytes,
            this.content_data.df.stats.total_avail_bytes
          ]
        }
      ],
      options: {
        center_text: raw_usage_text,
        responsive: true,
        legend: { display: false },
        animation: { duration: 0 },
        tooltips: {
          callbacks: {
            label: (tooltipItem, chart) => {
              return (
                chart.labels[tooltipItem.index] +
                ': ' +
                this.dimlessBinary.transform(
                  chart.datasets[0].data[tooltipItem.index]
                )
              );
            }
          }
        }
      },
      colors: [
        {
          backgroundColor: [raw_usage_chart_color, '#424d52'],
          borderColor: 'transparent'
        }
      ],
      labels: ['Raw Used', 'Raw Available']
    };

    const colors = [
      '#3366CC',
      '#DC3912',
      '#FF9900',
      '#109618',
      '#990099',
      '#3B3EAC',
      '#0099C6',
      '#DD4477',
      '#66AA00',
      '#B82E2E',
      '#316395',
      '#994499',
      '#22AA99',
      '#AAAA11',
      '#6633CC',
      '#E67300',
      '#8B0707',
      '#329262',
      '#5574A6',
      '#3B3EAC'
    ];

    const pool_labels = [];
    const pool_data = [];

    _.each(this.content_data.df.pools, function(pool, i) {
      pool_labels.push(pool['name']);
      pool_data.push(pool['stats']['bytes_used']);
    });

    this.poolUsage = {
      chartType: 'doughnut',
      dataset: [
        {
          label: null,
          borderWidth: 0,
          data: pool_data
        }
      ],
      options: {
        responsive: true,
        legend: { display: false },
        animation: { duration: 0 },
        tooltips: {
          callbacks: {
            label: (tooltipItem, chart) => {
              return (
                chart.labels[tooltipItem.index] +
                ': ' +
                this.dimlessBinary.transform(
                  chart.datasets[0].data[tooltipItem.index]
                )
              );
            }
          }
        }
      },
      colors: [
        {
          backgroundColor: colors,
          borderColor: 'transparent'
        }
      ],
      labels: pool_labels
    };
  }
}

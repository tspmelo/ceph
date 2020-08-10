import { Component, Input, OnInit } from '@angular/core';

import { ChartOptions } from '../../models/chart-options';

@Component({
  selector: 'cd-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() options: Partial<ChartOptions>;

  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {};
  }

  ngOnInit() {
    this.chartOptions = Object.assign(this.chartOptions, this.options);
  }
}

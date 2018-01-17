import {Component, OnInit, Input, OnChanges} from '@angular/core';
import * as _ from 'underscore';

@Component({
  selector: 'cd-osd-perf-histogram',
  templateUrl: './osd-perf-histogram.component.html',
  styleUrls: ['./osd-perf-histogram.component.scss']
})
export class OsdPerfHistogramComponent implements OnInit, OnChanges {

  @Input() histogram: any;
  valuesStyle: any;
  last = {};


  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    console.log("# ngOnChanges:");
    console.log(this.histogram);
    this.render();
  }


  hexdigits(v) {
    const i = Math.floor(v * 255);
    if (Math.floor(i) < 0x10) {
      return "0" + Math.floor(i).toString(16);
    } else {
      return Math.floor(i).toString(16);
    }
  }

  hexcolor(r, g, b) {
    return "#" + this.hexdigits(r) + this.hexdigits(g) + this.hexdigits(b);
  }

  render() {
    // var data = content_data.osd_histogram.osd[counter];
    // var hist_table = $(element);
    // hist_table.empty();

    var sum = 0.0;
    var max = 0.0;

    _.each(this.histogram.values, (row, i) => {
      _.each(row, (col, j) => {
        var val;
        if (!this.last) {
          val = col;
        } else {
          val = col - this.last[i][j];
        }
        sum += val;
        max = Math.max(max, val);
      });
    });


    const values = [];
    _.each(this.histogram.values, (row, i) => {
      values[i] = new Array(row.length);
      _.each(row, (col, j) => {
        var val;
        if (!this.last) {
          val = col;
        } else {
          val = col - this.last[i][j];
        }
        var g;
        if (max) {
          g = (val / max);
        } else {
          g = 0.0;
        }
        var r = 1.0 - g;
        var b = 0.0;
        values[i][j] = {backgroundColor: this.hexcolor(r, g, b)};
      });
    });

    this.valuesStyle = values;
    this.last = this.histogram.values;
  };
}

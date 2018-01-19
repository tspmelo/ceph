import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monitorSparklineData'
})
export class MonitorSparklineDataPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let result = '';
    for (let i = 1; i < value.length; ++i) {
      const y = value[i][1];
      result += y + ',';
    }
    return result;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sparklineData'
})
export class SparklineDataPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let result = '';
    for (let i = 1; i < value.length; ++i) {
      const deltaV = value[i][1] - value[i - 1][1];
      const deltaT = value[i][0] - value[i - 1][0];
      result += deltaV / deltaT + ',';
    }
    return result;
  }
}

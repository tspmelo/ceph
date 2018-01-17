import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'osdSparklineData'
})
export class OsdSparklineDataPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let result = "";
    for (let i = 1; i < value.length; ++i) {
        const delta_v = value[i][1] - value[i - 1][1];
        const delta_t = value[i][0] - value[i - 1][0];
        result += (delta_v / delta_t + ",");
    }
    return result;
  }

}

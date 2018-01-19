import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'poolSizeBar'
})
export class PoolSizeBarPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const ratio = value.used / value.avail;

    return {
      width: Math.round(ratio * 100).toString() + '%'
    };
  }
}

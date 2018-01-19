import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'syncProgressBar'
})
export class SyncProgressBarPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const ratio = value / 100.0;
    return 'width: ' + Math.round(ratio * 100).toString() + '%';
  }
}

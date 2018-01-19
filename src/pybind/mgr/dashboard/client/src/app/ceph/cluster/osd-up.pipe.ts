import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'osdUp'
})
export class OsdUpPipe implements PipeTransform {

  transform(osdUp: any, args?: any): any {
    return osdUp ? 'up' : 'down';
  }

}

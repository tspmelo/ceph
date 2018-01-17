import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'osdIn'
})
export class OsdInPipe implements PipeTransform {

  transform(osdIn: any, args?: any): any {
    return osdIn ? 'in' : 'out';
  }

}

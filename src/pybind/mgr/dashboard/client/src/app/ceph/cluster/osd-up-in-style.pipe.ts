import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'osdUpInStyle'
})
export class OsdUpInStylePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value ? {color: '#00bb00'} : {color: '#bb0000'};
  }

}

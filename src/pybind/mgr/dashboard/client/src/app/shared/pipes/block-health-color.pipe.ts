import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'blockHealthColor'
})
export class BlockHealthColorPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value.errors > 0) {
      return 'color: #ff0000';
    } else if (value.warnings > 0) {
      return 'color: #ffc200';
    }
    return '';
  }
}

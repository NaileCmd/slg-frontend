import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true 
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string): string {
    if (value.length !== 8) {
      return value; // Return as is if the format is unexpected
    }

    const day = value.substring(0, 2);
    const month = value.substring(2, 4);
    const year = value.substring(4, 8);

    return `${day}.${month}.${year}`;
  }

}

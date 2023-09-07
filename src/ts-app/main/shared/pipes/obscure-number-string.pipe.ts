import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obscureNumberString'
})
export class ObscureNumberStringPipe implements PipeTransform {

  transform(input: string, obscure: boolean): unknown {
    return obscure
         // Replace all digits up to the decimal point with '?'.
         // If there is no decimal, then replace all but the last digit.
         // If there is only one digit, replace it.
         ? input.replace(/(\d+)/, function (_, b) {
            if (input.indexOf(".") > -1 || b.length === 1) {
               return "?".repeat(b.length);
            } else {
               return "?".repeat(b.length - 1) + b[b.length - 1];
            }
         })
         : input;
  }

}

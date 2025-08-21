import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function mobileNumberValidator(): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    const value: string = control.value;

    // Ensure the number starts with "+998 "
    if (!value.startsWith("+998 ")) {

      return { invalidFormat: "Mobile number must start with +998 " };

    }

    // Remove "+998 " to validate the digits

    const numberPart = value.replace("+998 ", "");

    // If the number starts with '0', it must have exactly 10 digits

    if (numberPart.startsWith("0")) {

      if (numberPart.length !== 10) {

        return { invalidMobile: "Invalid Phone Number" };

      }

    } 

    // If it does not start with '0', it must have exactly 9 digits

    else {

      if (numberPart.length !== 9) {

        return { invalidMobile: "Invalid Phone Number" };

      }

    }

    return null; // ✅ Valid number
  };
}

import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {

  return (formGroup: AbstractControl): ValidationErrors | null => {

    const form = formGroup as FormGroup;

    const control = form.get(controlName);

    const matchingControl = form.get(matchingControlName);

    if (!control || !matchingControl) return null; // Ensure controls exist

    // If confirmPassword already has errors, don't overwrite them
    if (matchingControl.errors && !matchingControl.errors['matchValidator']) {

      return null;

    }

    // If passwords don't match, set an error
    if (control.value !== matchingControl.value) {

      return { matchValidator: true };
      
    }

    return null; // No error if passwords match
  };
}

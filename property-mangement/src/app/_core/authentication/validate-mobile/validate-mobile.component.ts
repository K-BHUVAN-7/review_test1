import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { mobileNumberValidator } from '@app/shared/validators/mobile-validator';
@Component({
  selector: 'app-validate-mobile',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './validate-mobile.component.html',
  styleUrl: './validate-mobile.component.scss'
})
export class ValidateMobileComponent {

  validationForm!: FormGroup;
  submitted: boolean = false;

  constructor(private fb: FormBuilder,private router: Router) {

    sessionStorage.clear();

    this.validationForm = this.fb.group({

      "mobileNo": ["+998 ",[Validators.required,mobileNumberValidator()]]

    });

    this.validationForm.get('mobileNo')?.valueChanges.subscribe(value => {

      if (!value.startsWith("+998 ")) {

        this.validationForm.get('mobileNo')?.setValue("+998 ", { emitEvent: false });

      }

    });

  }

  get f(): any { return this.validationForm.controls }

  sendOtp() {

    this.submitted = true;

    if (this.validationForm.invalid) return;

    sessionStorage.setItem("mobileNumber",this.validationForm.value.mobileNo);

    this.router.navigate(['/auth/validate-otp'])

  }

}
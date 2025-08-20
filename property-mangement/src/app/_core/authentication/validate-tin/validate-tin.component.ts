import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import moment from 'moment';

@Component({
  selector: 'app-validate-tin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  templateUrl: './validate-tin.component.html',
  styleUrl: './validate-tin.component.scss'
})
export class ValidateTinComponent {

validationForm!: FormGroup;
submitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router) {

    this.validationForm = this.fb.group({

      innNo: ['',[Validators.required,Validators.pattern(/^[1-2]\d{13}$/),this.validDateValidator ]]

    });
    
  }

 get f(): any { return this.validationForm.controls }

  validDateValidator(control: AbstractControl): ValidationErrors | null {

    const inn: string = control.value;

    if (!inn) return null;
    
    const dateString = `${inn.substring(1, 3)}-${inn.substring(3, 5)}-${inn.substring(5, 9)}`;

    if (!moment(dateString, 'DD-MM-YYYY', true).isValid()) {

      return { invalidDate: true };
      
    }

    return null;

  }

  submit() {

    this.submitted = true;

    if (this.validationForm.invalid) {

      return;

    }

    sessionStorage.setItem('INN', this.validationForm.value.innNo);

    this.router.navigate(['/auth/register'])

  }

}
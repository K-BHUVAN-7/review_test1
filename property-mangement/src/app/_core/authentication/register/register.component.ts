import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { matchValidator} from '@app/shared/validators/match-validator'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatCheckboxModule,
    SharedModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  registerForm!: FormGroup;
  submitted: boolean = false;


    constructor(private fb: FormBuilder,private router: Router) {
  
      this.registerForm = this.fb.group({
  
        "innNo": [,[Validators.required]],

        "password":['', [Validators.required, Validators.minLength(8),Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],

        "confirmPassword" : ['',Validators.required]
  
      },{ validator: matchValidator('password', 'confirmPassword') }) 

      const storedInnNo: any = sessionStorage.getItem('INN');

      if (storedInnNo) {

        this.registerForm.patchValue({ innNo: storedInnNo });

      }

    }
  
    get f(): any { return this.registerForm.controls }
  
    submit() {
  
      this.submitted = true;
  
      if (this.registerForm.invalid) {
  
        return;
  
      }
  
      this.router.navigate(['/auth/login'])
  
    }
  

}

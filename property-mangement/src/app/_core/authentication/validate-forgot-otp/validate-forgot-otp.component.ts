import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgOtpInputModule } from 'ng-otp-input';

@Component({
  selector: 'app-validate-forgot-otp',
  standalone: true,
  imports: [
    NgOtpInputModule,
    RouterModule
  ],
  templateUrl: './validate-forgot-otp.component.html',
  styleUrl: './validate-forgot-otp.component.scss'
})
export class ValidateForgotOtpComponent {

   constructor(private router: Router) {}

  save(){

    sessionStorage.setItem("isForgetOtpVerified","TRUE");

    this.router.navigate(["/auth/set-password"]);

  }

}

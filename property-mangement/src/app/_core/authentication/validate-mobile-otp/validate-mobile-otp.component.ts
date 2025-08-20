import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { NgOtpInputModule } from 'ng-otp-input';
@Component({
  selector: 'app-validate-mobile-otp',
  standalone: true,
  imports: [
    NgOtpInputModule,
    SharedModule
  ],
  templateUrl: './validate-mobile-otp.component.html',
  styleUrl: './validate-mobile-otp.component.scss'
})
export class ValidateMobileOtpComponent {

  mobileNumber: any = sessionStorage.getItem("mobileNumber");
  time: number = 180;
  Math: any = Math;
  otp: any = "";
  submitted: boolean = false;

  constructor(private router: Router) {

    sessionStorage.removeItem("isMobileNumberVerified");

    this.startTimer();

  }

  startTimer() {

    const timer = setInterval(()=>{

      this.time--;

      if(this.time == 0) clearInterval(timer);

    },1000)

  }

  resendOtp() { }

  verifyOTP() {

    this.submitted = true;

    if(this.otp.length < 4) return;

    this.router.navigate(["/auth/validate-inn"]);

    sessionStorage.setItem("isMobileNumberVerified","TRUE");

  }

}

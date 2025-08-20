import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import { SharedModule } from '@shared/shared.module';
import _ from 'lodash';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    SharedModule,
    CommonModule
  ],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss'
})
export class VerifyOtpComponent {
  verificationOtp: string = "";
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  email: string = "";
  time: number = 120;
  Math: any = Math;
  _: any = _;

  constructor(private service: CommonService) { 

    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    this.email = this.service.session({ "method": "get", "key": "ForgetEmail" });

    if(_.isEmpty(this.email) || !expression.test(this.email)) this.service.navigate({ "url": "/auth/forget-password" });

    else this.startTimer();

  }

  ngOnInit(): void {}

  startTimer(): any {

    let interval = setInterval(() => {

      this.time--;

      if(this.time == 0) clearInterval(interval);

    }, 1000);

  }

  resendOtp(): any {

    this.isLoading = true;

    this.service.postService({ "url": "/sendOtp", 'payload': { "email": this.email }, params :  { 'eventName' : 'forgot-password' } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.verificationOtp = "";

        this.time = 120;

        this.startTimer();

        this.isLoading = false;

        this.service.showToastr({ 'data': { 'message': 'OTP Sent Successfully', 'type': 'success' } });

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }

  // Submit OTP

  submit(): any {
    
    if(_.size(this.verificationOtp) < 4) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.postService({ "url": "/verifyOTP", 'payload': { "verificationCode": this.verificationOtp } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "OTP Verified Successfully", "type": "success" } });

        this.service.session({ "method": "set", "key": "ResetPwdMail", "value": this.email });

        this.service.navigate({ "url": "/auth/create-password" });

        this.isLoading = false;

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }
  
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.service.session({ "method": "remove", "key": "ForgetEmail" })
  }

}

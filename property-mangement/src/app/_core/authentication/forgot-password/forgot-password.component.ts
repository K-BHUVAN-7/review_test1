import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import { SharedModule } from '@shared/shared.module';
import _ from 'lodash';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgetPwdForm!: FormGroup;
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  _: any = _;

  constructor(private service: CommonService) { }

  ngOnInit(): void {
    
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    let email = this.service.session({ "method": "get", "key": "ForgetEmail" });

    if(!_.isEmpty(email)) {

      if(!expression.test(email)) this.service.session({ "method": "remove", "key": "ForgetEmail" });
      
      else this.service.navigate({ "url": "/auth/verify-otp" });

    }

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

  }

  // Initiate login form

  loadForm() {

    this.formSubmitted = false;

    this.forgetPwdForm = this.service.fb.group({

      'email': ['', [Validators.required, Validators.email]]

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.forgetPwdForm.controls }

  // Login user

  submit(): any {
    
    if(this.forgetPwdForm.invalid) return this.formSubmitted = true;

    this.isLoading = true;

    this.service.postService({ "url": "/sendOtp", 'payload': this.forgetPwdForm.value , params : { 'eventName' : 'forgot-password' } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.session({ "method": "set", "key": "ForgetEmail", "value": this.forgetPwdForm.value.email });

        this.service.showToastr({ 'data': { 'message': 'OTP Sent Successfully', 'type': 'success' } });

        this.service.navigate({ "url": "/auth/verify-otp" });

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }

}


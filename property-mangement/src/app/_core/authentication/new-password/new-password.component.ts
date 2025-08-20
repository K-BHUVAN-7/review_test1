import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { matchValidator } from '@app/shared/validators/match-validator';
import _ from 'lodash';


@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SharedModule
  ],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {

  showPassword: boolean = false;
  showConfirmPassword: boolean = false
  createPwdForm!: FormGroup;
  submitted: boolean = false;
  email: string = ''
  _: any = _;
  formSubmitted: boolean = false;
  loginType: any;

  constructor(private fb: FormBuilder,private router: Router,private service: CommonService, private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.loginType = params['type'];

      if (this.loginType == 'passSetup') {

        let email = this.service.session({ 'method': 'get', 'key': 'passSetup' });

        this.loadForm();

        this.createPwdForm?.patchValue({

          'email': email,

          'isPassSetup': true

        });

      } else {

        const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

        this.email = this.service.session({ "method": "get", "key": "ResetPwdMail" });
        
        if(_.isEmpty(this.email) || !expression.test(this.email)) this.service.navigate({ "url": "/auth/forget-password" });

        this.loadForm();

      }

    }) 
    
    // const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    // this.email = this.service.session({ "method": "get", "key": "ResetPwdMail" });
    
    // if(_.isEmpty(this.email) || !expression.test(this.email)) this.service.navigate({ "url": "/auth/forget-password" });

    // this.loadForm()

  }

  loadForm() {

    this.formSubmitted = false;

    this.createPwdForm = this.service.fb.group({

      'email': [ this.email, [Validators.required, Validators.email]],

      'password': [ '', [Validators.required, Validators.minLength(8)]],

      'confirmPassword': [ '', [Validators.required]]

    })

  }

  get f(): any { return this.createPwdForm.controls }

  // submit() {

  //   this.submitted = true;

  //   if (this.forgetPasswordForm.invalid) return;

  //   this.service.postService({ "url": "/verifyOTP", 'payload': { "verificationCode": this.verificationOtp } }).subscribe((res: any) => {

  //     if(res.status=='ok') {

  //       this.service.showToastr({ "data": { "message": "OTP Verified Successfully", "type": "success" } });

  //       this.service.navigate({ "url": "/auth/create-password" });

  //     } 

  //   },(err: any)=>{

  //     this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } }); 

  //   });

  //   this.router.navigate(['/auth/login'])

  //   this.service.showToastr({ data: { message: "Password Changed Successfull", type: "success" } });

  // }

  submit(): any {

    if(this.createPwdForm.invalid) return this.formSubmitted = true;

    let params

    let payload: any = this.createPwdForm.value;

    if(this.loginType == 'passSetup') {

      payload = { ...payload, 'isPassSetup': true }

    }

    payload = _.omit(payload,'confirmPassword')

    this.service.postService({ "url": "/resetPassword", params, payload }).subscribe((res: any) => { 

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Password created successfully", "type": "success" } });

        this.service.navigate({ "url": "/auth/login" })
      } 

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error.message || "Internal Server", "type": "error" } });

    });

  }

}
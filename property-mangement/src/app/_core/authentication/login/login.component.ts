import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import * as _ from 'lodash';
declare var google : any 


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup = new FormGroup({})
  isLoading: boolean = false;
  formSubmitted: boolean = false;
  loginUserType: string = 'auth';
  _: any = _;
  loginList: any = [];

  constructor(public service: CommonService,private afAuth: AngularFireAuth ,private router: Router ) {
    
    this.loadForm();

  }

  ngOnInit(): void {

    google?.accounts.id.initialize({

      client_id : '623914904270-36ls9t8mli3sc7u4820jrvgv1756q58q.apps.googleusercontent.com',

      callback: (response : any ) => {

        this.handleLogin(response)

      }

    });

    google.accounts.id.renderButton(document.getElementById("google-btn"),{

      theme : 'outline',

      size : 'large',

      shape: 'rectangle',

    })

  }

  private decodeToken(token : any){

    return JSON.parse(atob(token.split(".")[1]))

  }

  handleLogin(response : any){

    if(response){

      const responsePayload =  this.decodeToken(response.credential);

      sessionStorage.setItem('loginUser',JSON.stringify(responsePayload))

      let payload = { "email": responsePayload?.email, "authType": "google" , 'administratorName' : responsePayload.name , firebaseId : responsePayload.sub };

      this.service.postService({ "url": "/googleRegister", 'payload': payload }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });

          this.service.login(res.data);

        }

      },(err: any)=>{

        this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 
  
        this.isLoading = false;
  
      });
            

    }

  }

  loadForm() {
    
    this.formSubmitted = false;

    this.loginForm = this.service.fb.group({

      "email": ["", Validators.required],

      "password": ["", Validators.required]

    });

  }

  get f(): any { return this.loginForm.controls; }

  // loginWithGoogle() {
    
  //   this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((res: any) => {

  //     let { profile } = res.additionalUserInfo;

  //     let payload = { "email": profile.email, "authType": "google" , 'administratorName' : profile.name, firebaseId : profile.id };

  //     if(profile.email) {

  //       this.service.postService({ "url": "/googleRegister", 'payload': payload }).subscribe((res: any) => {

  //         if(res.status=='ok') {

  //           this.service.login(res.data);

  //         }

  //       },(err: any)=>{

  //         this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 
    
  //         this.isLoading = false;
    
  //       });

  //     }

  //   }); 

  // }

  submit() {

    this.formSubmitted = true;

    if(this.loginForm.invalid) return

    let payload = this.loginForm.getRawValue()
    
    this.service.postService({ "url": '/login', payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.loginList = res.data;

        if(this.loginList?.userDetails?.isPassSetup == false && this.loginList?.userDetails?.isAdminUser == false) {

          this.service.session({ 'method': 'set', 'key': 'passSetup', 'value': this.loginList?.userDetails?.email });

          let queryParams: any = { 'type': 'passSetup' };

          this.service.navigate({ "url": "/auth/create-password", queryParams })

        } else {

          this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });
  
          this.service?.login(res.data);

          // this.service.login(res.data).then(() => {

          //   const menuList = JSON.parse(this.service.session({ method: 'get', key: 'MenuList' }) || '[]');

          //   const firstMenuItem :any = _.first(menuList);

          //   const url:any = _.get(firstMenuItem, 'subMenu[0].url', firstMenuItem?.url);

          //   this.service.navigate({ url: `/app/${url}` });

          // });

        }

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }

  // submit() {

  //   this.formSubmitted = true

  //   if(this.loginForm.invalid) return

  //   let payload = this.loginForm.getRawValue()
    
  //   this.service.postService({ "url": '/login', payload }).subscribe((res: any) => {

  //     if(res.status=='ok') {

  //       this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });

  //       this.service.login(res.data);

  //     } else this.isLoading = false;

  //   },(err: any)=>{

  //     this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 

  //     this.isLoading = false;

  //   });

  // }

  route(){

    this.router.navigate(['/auth/sign-up'])

  }

}

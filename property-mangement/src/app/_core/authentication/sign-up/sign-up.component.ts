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
  selector: 'app-sign-up',
  standalone: true,
  imports: [  
    RouterModule,
    CommonModule,
    SharedModule,],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
signupForm: FormGroup = new FormGroup({})
isLoading: boolean = false;
dialCodeList: Array<any> = [];
countryList: Array<any> = [];
formSubmitted: boolean = false;
loginUserType: string = 'auth';
_: any = _;


  constructor(public service: CommonService,private router: Router) {
    
    this.loadForm();

    // this.getDialCode() ;

    this.getCountryCode();

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

    }

  }

  loadForm() {
    
    this.formSubmitted = false;

    this.signupForm = this.service.fb.group({

      'firstName' : ['',Validators.required],

      'lastName' : ['',Validators.required],

      'mobileNo' : ['',Validators.required],

      'dialCode': ['',Validators.required],

      "email": ["", [Validators.required, Validators.email]],

      "password": ["", [Validators.required, Validators.min(8)],],

      "confirmPassword":['',Validators.required]

    },{

      validator: this.service.matchValidator('password', 'confirmPassword')

    });

      fetch('https://ipapi.co/json/').then((res: any) => res.json()).then((res: any) => {   

      this.signupForm.get('dialCode')?.setValue(res.country_calling_code);

      let countryDet = _.find(this.countryList, { 'dialCode': res.country_calling_code });

      this.signupForm.patchValue({ 'countryId': countryDet._id || null, 'state': res.region })

    });   

  }

  get f(): any { return this.signupForm.controls; }

  // loginWithGoogle() {
    
  //   this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((res: any) => {

  //     let { profile } = res.additionalUserInfo;

  //     let payload = { "email": profile.email, "authType": "google" , 'administratorName' : profile.name, firebaseId : profile.id };

  //     if(profile.email) {

  //       this.service.postService({ "url": "/googleRegister", 'payload': payload }).subscribe((res: any) => {

  //         if(res.status=='ok') {

  //           // this.login(res.data);

  //         }

  //       },(err: any)=>{

  //         this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 
    
  //         this.isLoading = false;
    
  //       });

  //     }

  //   }); 

  // }

  getDialCode() {

    this.service.getService({ "url": "/dialCode" }).subscribe((res: any) => {

      this.dialCodeList = res.status=='ok' ? res.data : [];

    });

  }

  getCountryCode(): any {

    this.service.getService({ "url": "/countries" }).subscribe((res: any) => {

      this.countryList = res.status=='ok' ? res.data : [];

    });
    
  }

  submit() {

    this.formSubmitted = true 

    if(this.signupForm.invalid) return

    let payload = _.extend(this.signupForm.getRawValue(),{'isAdminUser' : true,'userType' : 'admin'}) 

    this.service.postService({ "url": '/register', payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Registered successfully", "type": "success" } });

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(res.data) });

        this.router.navigate(['/auth/company-register']);

      } else this.isLoading = false;

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 

      this.isLoading = false;

    });

  }

  // login(responseData:any){

  //   this.service.showToastr({ "data": { "message": "Logged in successfully", "type": "success" } });

  //   this.service.session({ "method": "set", "key": "AuthToken", "value": responseData.token });

  //   this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(responseData.userDetails) });

  //   let permissions: any = {};

  //   let menuList: any[] = [];

  //   _.forEach(responseData.permissions.permissions,(menuDet: any)=>{

  //     permissions[menuDet.label] = _.reduce(menuDet.branches,(initialValue,branchDet)=>{ 

  //       if(_.size(branchDet.permission) > 0)
        
  //         initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission }); 
          
  //       return initialValue 
      
  //     },{ "permissions": {}, "subMenu": {} }); 

  //     if(menuDet.url) {

  //       let menu = _.cloneDeep(menuDet);

  //       menu['subMenu'] = _.toArray(_.pickBy(_.map(menuDet.subMenu,(smOne: any): any =>{

  //         permissions[menuDet.label]['subMenu'][smOne.label] = _.reduce(smOne.branches,(initialValue,branchDet)=>{ 
          
  //           if(_.size(branchDet.permission) > 0)
            
  //             initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission });
              
  //           return initialValue; 
          
  //         },{ "permissions": {}, "subMenu": {} });       

  //         if(!smOne.url) return null;

  //           smOne['subMenu'] = _.toArray(_.pickBy(_.map(smOne.subMenu,(smTwo: any): any => {

  //               permissions[menuDet.label]['subMenu'][smOne.label]['subMenu'][smTwo.label] = 
                
  //               _.reduce(smTwo.branches,(initialValue,branchDet)=>{ 
              
  //                 if(_.size(branchDet.permission) > 0)
                  
  //                   initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission }); 
                    
  //                 return initialValue;
                
  //               },{ "permissions": {}, "subMenu": {} }); 

  //               if(!smTwo.url) return null;

  //               smTwo['subMenu'] = _.toArray(_.pickBy(_.map(smTwo.subMenu,(smThree: any): any => {

  //                 permissions[menuDet.label]['subMenu'][smOne.label]['subMenu'][smTwo.label]['subMenu'][smThree.label] = 
                  
  //                 _.reduce(smThree.branches,(initialValue,branchDet)=>{ 
                
  //                   if(_.size(branchDet.permission) > 0)
                    
  //                     initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission });  
                      
  //                   return initialValue;
                  
  //                 },{ "permissions": {}, "subMenu": {} }); 

  //                 if(!smThree.url) return null;

  //                 smThree['subMenu'] = _.filter(smThree.subMenu,(item: any): any => item.url != '');

  //                 if(_.size(smThree['subMenu']) == 0) delete smThree['subMenu'];

  //                 return _.omit(smThree,"branches")

  //               })));

  //               if(_.size(smTwo['subMenu']) == 0) delete smTwo['subMenu'];

  //               return _.omit(smTwo,"branches")

  //           })));
            
  //           if(_.size(smOne['subMenu']) == 0) delete smOne['subMenu'];

  //           return _.omit(smOne,"branches")

  //       })));

  //       _.size(menu['subMenu']) == 0 ? delete menu['subMenu'] : null;

  //       menuList.push(_.omit(menu,'branches'));

  //     }

  //   });

  // }
  
  route(){

    this.router.navigate(['/auth/sign-up'])

  }


}

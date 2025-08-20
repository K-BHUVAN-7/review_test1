import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import * as _ from 'lodash';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
declare var google : any 

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [ RouterModule,
    CommonModule,
    SharedModule,],
  templateUrl: './company-register.component.html',
  styleUrl: './company-register.component.scss'
})
export class CompanyRegisterComponent {

companyRegisterForm: FormGroup = new FormGroup({})
isLoading: boolean = false;
dialCodeList: Array<any> = [];
countryList: Array<any> = [];
loginUserType: string = 'auth';
formSubmitted: Boolean = false;
userDetails: any;
changingCurrencyCode = false;
isAutoCurrencyChange = false;
previousCurrencyCode: string | null = null;


masterList: any = {};

_: any = _;


  constructor(public service: CommonService,private router: Router, private confirmationDialog: ConfirmationDialogService) {
    
    this.loadForm();

    this.getCountryCode();

    this.getCurrencyCode();

  }

  loadForm() {

    this.formSubmitted = false;

    this.companyRegisterForm = this.service.fb.group({

      'name': ['', Validators.required],
      
      'taxNo': [''],
      
      'address': ['', Validators.required],
      
      'city': ['', Validators.required],
      
      'pincode': ['', Validators.required],
      
      'state': ['', Validators.required],
      
      'countryId': ['', Validators.required],
      
      'currencyCode': [null, Validators.required]
    
    });

    this.companyRegisterForm.get('countryId')?.valueChanges.subscribe((value: any) => {

      const selectedCountry = this.masterList['countryList'].find((item: { _id: any; }) => item._id == value);

      const newCurrencyCode = selectedCountry?.currencyId || '';

      if (newCurrencyCode) {

        this.isAutoCurrencyChange = true;

        this.companyRegisterForm.patchValue({ 'currencyCode': newCurrencyCode });

      }

    });

  }

  changeCountry(type ?: String){

    if(type == 'change'){

      this.confirmationDialog.confirm({
      
        title: "Are you sure?",
      
        message: "Changing the currency will affect the whole Application,Do you want to continue?",
      
        type: "info",
      
        isContent: false
      
      }).then((confirmation: any) => {
      
        if (confirmation) {
      
          this.changingCurrencyCode = true;
      
        } else {
      
        this.companyRegisterForm.patchValue({

          currencyCode: this.previousCurrencyCode

        });

        this.isAutoCurrencyChange = true;

        }

      });
  
    } 

  }

  storePreviousCurrencyCode() {
  this.previousCurrencyCode = this.companyRegisterForm.get('currencyCode')?.value;
  }


  get f(): any { return this.companyRegisterForm.controls; }

  getDialCode() {

    this.service.getService({ "url": "/dialCode" }).subscribe((res: any) => {

      this.dialCodeList = res.status=='ok' ? res.data : [];

    });

  }

  getCurrencyCode(): any {

    this.service.getService({ "url": "/currencies" }).subscribe((res: any) => {

      this.masterList['currencyCodeList'] = res.status == 'ok' ? res.data : [];

    });
    
  }

  getCountryCode(): any {

    this.service.getService({ "url": "/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status == 'ok' ? res.data : [];

      this.companyRegisterForm.patchValue({

        'countryId': _.find(this.masterList['countryList'], (e:any) => e.name == 'United States')?._id,

        'currencyCode': _.find(this.masterList['countryList'], (e:any) => e.name == 'United States')?.currencyId,

      })

    });
    
  }

  
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

  submit() {

    this.formSubmitted = true 

    if(this.companyRegisterForm.invalid) return
    
    let payload = this.companyRegisterForm.getRawValue();
    
    const userDetailsString: string | null = sessionStorage.getItem("UserDetails");
    
    this.userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
    
    payload = _.extend(this.companyRegisterForm.getRawValue(),{
      
      'email' : this.userDetails?.email,
      
      'manualCurrencyChange': this.changingCurrencyCode
      
    });

    this.service.postService({ "url": '/parentCompany', payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Company Created successfully", "type": "success" } });

        this.service.login(res.data)  

        // this.router.navigate(['/app/dashboard']);

      } 

    },(err: any)=>{

      this.service.showToastr({ "data": { "message": err.error?.message || "Internal Server", "type": "error" } }); 

    });

  }

  route(){

    this.router.navigate(['/auth/sign-up'])

  }


}

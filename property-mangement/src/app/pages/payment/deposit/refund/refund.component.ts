import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.scss'
})
export class RefundComponent {

  constructor(private fb: FormBuilder,public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute) { } 
        
  refundForm: FormGroup = new FormGroup({});
  editData:any = {};
  _: any = _;
  userDetails: any = {};
  permissions : any = {};
  formSubmitted : Boolean = false;
  masterList : any = {}
  mode : string = "Create";
  queryParamsValue: any = {};

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  paymentModeList: any = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'netBanking', label: 'Net Banking' }
  ];

  adjustFreeRent: boolean = false;

  usePDC: boolean = true;
  
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url' : '/payment/deposit/list', payload : {'parentCompanyId' : this.userDetails.parentCompanyId , "_id" : this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.find(res.data, { _id: this.queryParamsValue }) || {};

            this.loadForm();

          }

        })

      } else {

        this.mode=='Create'

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Deposit'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                    
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getAllDetails();
    
    this.loadForm();

  }

  loadForm() {

    this.formSubmitted = false;

    this.refundForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'propertyName': [ this.editData?.property?._id || null, [Validators.required] ],

      'unitName': [ this.editData?.unit?._id || null, [Validators.required] ],

      'depositAmount': [ this.editData?.depositAmount || '', [Validators.required] ],
      
      'paymentDate': [ this.editData?.paymentDate || '',  [Validators.required] ],
      
      'refundAmount': [ 0,  [Validators.required, this.amountPaidValidator()] ],

      'type': [ 'refund' ],

      'paymentMode': [ 'cash' ],

      'transactionId': [ '' ],

      'accountNo': [ '' ],

      'refNo': [ '' ],

      'bank': [ '' ],

      'branch': [ '' ],
      
      'chequeNo': [ '' ],

      'otherDetails': [ '' ],

    });

    this.setPayValidater(this.refundForm.get('paymentMode')?.value);

    this.refundForm.get('paymentMode')?.valueChanges.subscribe((mode) => {

      this.setPayValidater(mode);
    
    });
  
  }

   amountPaidValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      let formGroup = control.parent;

      if (formGroup) {

        let refundAmount = control.value;

        let depositAmount = formGroup.get('depositAmount')?.value;

        if (refundAmount > depositAmount) {

          return { amountExceedsDue: true };

        }

      }

      return null;

    };

  }

  setPayValidater(mode: string) {

    let f = this.refundForm;

    ['transactionId', 'accountNo', 'refNo', 'bank', 'branch', 'chequeNo'].forEach(field => {

      f.get(field)?.clearValidators();
      
      f.get(field)?.setValue(f.get(field)?.value || '');

    });

    if (mode != 'cash') {
    
      f.get('transactionId')?.setValidators(Validators.required);
  
    }

    if (mode == 'netBanking') {
  
      f.get('accountNo')?.setValidators(Validators.required);
    
      f.get('bank')?.setValidators(Validators.required);
    
      f.get('branch')?.setValidators(Validators.required);
  
    }

    if (mode == 'cheque') {
  
      f.get('refNo')?.setValidators(Validators.required);
  
      f.get('chequeNo')?.setValidators(Validators.required);
  
      f.get('bank')?.setValidators(Validators.required);
  
      f.get('branch')?.setValidators(Validators.required);
    
    }

    ['transactionId', 'accountNo', 'refNo', 'bank', 'branch', 'chequeNo'].forEach(field => {
  
      f.get(field)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  
    });
  
  }

  get f(): any { return this.refundForm.controls; }

  getAllDetails(){

    forkJoin({

      'countryIdList': this.service.getService({ "url": "/countries" }),

      'rolesList': this.service.postService({'url' : '/master/roles/list' , payload : {'parentCompanyId' : this.userDetails.parentCompanyId } })

    }).subscribe({

      next: (res: any) => {

        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || []

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || []

      }

    });

  }

  submit() {

    this.formSubmitted = true;

    if(this.refundForm.invalid) return;

    let payload = this.refundForm.getRawValue();

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['dueDate', 'paymentDate']});

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
    
        this.service.patchService({ url: `/payment/deposit/${this.editData?._id}`, payload }).subscribe((res: any) => {

        if (res.status == 'ok') {

          this.formSubmitted = false;

          this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

          this.service.navigate({ 'url': 'app/payment/deposit' });

        }

      });

      }

    })
    
  }

}

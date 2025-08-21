import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pay-utility-amount',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './pay-utility-amount.component.html',
  styleUrl: './pay-utility-amount.component.scss'
})
export class PayUtilityAmountComponent {

  constructor(private fb: FormBuilder, public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute) { } 
          
  utilityPaymentForm: FormGroup = new FormGroup({});
  editData: any = {};
  _: any = _;
  userDetails: any = {};
  permissions: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {}
  mode: string = "Create";
  queryParamsValue: any = {};

  paymentMode: any;

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  paymentModeList: any = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'netBanking', label: 'Net Banking' }
  ];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url' : '/utility-bill/list' , payload : {'parentCompanyId' : this.userDetails.parentCompanyId , "_id" : this.queryParamsValue } }).subscribe((res: any) => {

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

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Utility Payment'], isNeedBranchList: true, 'permission': ['create','view','edit','delete', 'approve']});
                    
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList':  this.permissions.viewPermission?.branchList || []

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

    this.utilityPaymentForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'property': [ this.editData?.property?._id || '' ],

      'unit': [ this.editData?.unit?._id || '' ],

      'utility': [ this.editData?.utility?._id || '' ],

      'dueDate': [ this.editData?.dueDate || '' ],

      'invoiceNo': [ this.editData?.invoiceNo || '' ],

      'paymentDate': [ this.editData?.paymentDate || '', Validators.required ],

      'amountDue': [ ((this.editData.amountPaid == 0) ? this.editData?.amountDue : this.editData?.amountOutstanding)  || '' ],
      
      'amountPaid': [ '', [ Validators.required, this.amountPaidValidator()] ],
      
      'paymentMode': [ this.editData?.paymentMode || 'cash' ],

      'transactionId': [ this.editData?.transactionId ],

      'accountNo': [ this.editData?.accountNo || '' ],

      'refNo': [ this.editData?.refNo || '' ],

      'bank': [ this.editData?.bank || '' ],

      'branch': [ this.editData?.branch || '' ],
      
      'chequeNo': [ this.editData?.chequeNo || '' ],
      
      'otherDetails': [ this.editData?.otherDetails || '' ],

      'isPayment': [ true ],

    });

    this.setPayValidater(this.utilityPaymentForm.get('paymentMode')?.value);

    this.utilityPaymentForm.get('paymentMode')?.valueChanges.subscribe((mode) => {

      this.setPayValidater(mode);
    
    });
      
  }

  amountPaidValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      let formGroup = control.parent;

      if (formGroup) {

        let amountPaid = control.value;

        let amountDue = formGroup.get('amountDue')?.value;

        if (amountPaid > amountDue) {

          return { amountExceedsDue: true };

        }

      }

      return null;

    };

  }

  setPayValidater(mode: string) {

    let f = this.utilityPaymentForm;

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

  get f(): any { return this.utilityPaymentForm.controls; }

  getAllDetails(){

    forkJoin({

      'countryIdList': this.service.getService({ "url": "/countries" }),

      'rolesList': this.service.postService({'url' : '/master/roles/list' , payload : {'parentCompanyId' : this.userDetails.parentCompanyId } })

    }).subscribe({

      next: (res: any) => {

        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || [];

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];

      }

    });

  }

  submitPayment() {

    this.formSubmitted = true;

    if(this.utilityPaymentForm.invalid) return;

    let payload = this.utilityPaymentForm.getRawValue();

    if(payload.amountDue == payload.amountPaid) payload['status'] = 'Paid';

    this.service.changePayloadDateFormat({ 'data': payload, 'fields': ['dueDate', 'paymentDate']});

    if (this.permissions?.approvePermission?.branchIds?.length > 0) {

      payload['isApprovalUser'] = true;

    } else {

      payload['isApprovalUser'] = false;

    }

    payload = { ...payload, 'amountOutstanding': (payload.amountDue - payload.amountPaid) };

    // payload = _.omit(payload,['property', 'unit', 'utility']);

    let params: any = { type: 'utility' };

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
    
        this.service.patchService({ url: `/utility-bill/${this.editData?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.formSubmitted = false;

            this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

            this.service.navigate({ 'url': 'app/payment/utility' });

          }

        });

      }

    })
    
  }

}
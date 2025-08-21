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
  selector: 'app-update-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './update-payment.component.html',
  styleUrl: './update-payment.component.scss'
})
export class UpdatePaymentComponent {

  constructor(private fb: FormBuilder,public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute) { } 
    
  paymentForm: FormGroup = new FormGroup({});
  editData: any = {};
  _: any = _;
  userDetails: any = {};
  permissions: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {}
  mode: string = "Create";
  queryParamsValue: any = {};

  isFreeRent: boolean = false;
  filteredTenantList: any = '';

  // isPdc: boolean = true;

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  outstandingAmt: number = 0;

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

        this.service.postService({'url' : '/payment/rental/list', payload: { "_id": this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.find(res.data, { _id: this.queryParamsValue }) || {};

            console.log('Edit Data', this.editData);
            

            this.loadForm();

          }

        })

      } else {

        this.mode == 'Create';

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Rent'], isNeedBranchList: true, 'permission': [ 'create', 'view', 'edit', 'delete', 'approve' ]});
                   
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.loadForm();
    
    this.getTenantList();

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

  loadForm() {

    this.formSubmitted = false;

    let hasPaymentEntry = this.editData?.paymentEntries?.length > 0;

    // let amountDue = hasPaymentEntry ? this.editData?.paymentEntries[this.editData.paymentEntries.length - 1]?.amountOutstanding : this.editData?.amountDue;

    this.paymentForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'property': [ this.editData.property?._id || null ],

      'unit': [ this.editData.unit?._id || null ],

      'tenantId': [ this.editData?.tenantId?._id || null ],

      'dueDate': [ moment(this.editData?.dueDate).format('DD-MM-yyyy') || '', [Validators.required] ],

      'amountDue': [ (this.editData?.amountOutstanding == 0 ? this.editData?.amountDue : this.editData?.amountOutstanding), [Validators.required] ],

      'paymentDate': [ this.editData?.paymentDate || '', [Validators.required] ],

      'amountPaid': [ '', [Validators.required, this.amountPaidValidator()] ],

      'amountOutstanding': [ 0 ],

      'isFreeRent': [ this.editData?.isFreeRent || false ],

      'paymentMode': [ this.editData?.paymentMode || 'cash' ],

      'transactionId': [ this.editData?.transactionId ],

      'accountNo': [ this.editData?.accountNo || '' ],

      'refNo': [ this.editData?.refNo || '' ],

      'bank': [ this.editData?.bank || '' ],

      'bankBranch': [ this.editData?.bankBranch || '' ],

      'pdcId': [ this.editData?.pdcId ],
      
      'chequeNo': [ this.editData?.chequeNo || '' ],

      'chequeDate': [ this._.editData?.chequeDate || '' ],

      'rentDate': [ this._.editData?.rentDate || '' ],

      'isPdc': [ this.editData?.isPdc || false ],

      'otherDetails': [ this.editData?.otherDetails || '' ],

    });

    this.paymentForm.get('amountPaid')?.valueChanges?.subscribe((value) =>{

      let due = this.paymentForm?.get('amountDue')?.value || 0;

      this.paymentForm?.patchValue({

        'amountOutstanding': due - value

      });

    });

    let isFreeRent = this.paymentForm.get('isFreeRent')?.value;

    if (isFreeRent) {

      this.toggleadjustFreeRentFields(isFreeRent);

    }
  
  }

  getTenantList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' };

    this.service.postService({'url': '/otherUser/list', payload }).subscribe((res: any) => {

      if(res.status == 'ok') {

        let rentTenantId = this.editData?.tenantId?._id;

        this.masterList['tenantList'] = res.data;

        this.filteredTenantList = this.masterList['tenantList'].filter((tenant: any) =>
          
          tenant._id == rentTenantId

        );

      }

    });

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }): any {

    if (fieldName == 'isPdc') {

      let isPdc = this.paymentForm.get('isPdc')?.value;

      if (!isPdc) {

        let billDate = this.editData?.billDate;

        let pdcList = this.filteredTenantList?.[0]?.pdcList || [];

        let matchingPdc = pdcList.find((pdc: any) => {

          let bill = new Date(billDate).toISOString().split('T')[0];

          let rent = new Date(pdc.rentDate).toISOString().split('T')[0];

          return bill == rent;

        });

        if (matchingPdc) {

          this.paymentForm.patchValue({

            'pdcId': matchingPdc._id || '',

            'bank': matchingPdc.bankName || '',

            'bankBranch': matchingPdc.bankBranch || '',

            'chequeNo': matchingPdc.chequeNo || '',

            'chequeDate': matchingPdc.chequeDate || '',

            'rentDate': matchingPdc.rentDate || '',

            'amountPaid': matchingPdc.amount

          });

        } else {

          this.clearFields(['bank', 'bankBranch', 'chequeNo', 'chequeDate', 'rentDate', 'pdcId']);

        }

      } else {

        this.clearFields(['bank', 'bankBranch', 'chequeNo', 'chequeDate', 'rentDate', 'pdcId']);

      }

    }

    if (fieldName == 'isFreeRent') {

      let isFreeRent = this.paymentForm.get('isFreeRent')?.value;

      // Always toggle validators
      this.toggleadjustFreeRentFields(isFreeRent);

      if (!isFreeRent) {

        this.clearFields([

          'pdcId',

          'amountDue',

          'paymentDate',

          'amountPaid',

          'bank',

          'bankBranch',

          'chequeNo',

          'chequeDate',

          'rentDate',

        ]);

      } else{

        this.loadForm();

      }

    }

  }

  toggleadjustFreeRentFields(isFreeRent: boolean) {

    let fields = [

      'pdcId',

      'amountDue',

      'paymentDate',

      'amountPaid',

      'bank',

      'bankBranch',

      'chequeNo',

      'chequeDate' 

    ];

    fields.forEach(field => {

      let control = this.paymentForm.get(field);

      if (isFreeRent) {

        control?.setValidators(Validators.required);

      } else {

        control?.clearValidators();

      }

      control?.updateValueAndValidity();

    });

  }

  clearFields(fields: string[]) {

    let patchObj: any = {};

    fields.forEach(field => {

      patchObj[field] = '';

    });

    this.paymentForm.patchValue(patchObj);

  }

  get f(): any { return this.paymentForm.controls; }

  submitPayment() {

    this.formSubmitted = true;

    if(this.paymentForm.invalid) return;

    let payload = this.paymentForm.getRawValue();

    payload['updated_at'] = this.editData.updated_at;

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['dueDate', 'paymentDate']});

    // if (this.userDetails?.userType == 'manager') {

    //   payload['isApproved'] = true;

    // }

    if (this.permissions?.approvePermission?.branchIds?.length > 0) {

      payload['isApprovalUser'] = true;

    } else {

      payload['isApprovalUser'] = false;

    }

    console.log('Payload', payload);
    
    // return;

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/rental/${this.editData?._id}`, payload }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.formSubmitted = false;

            this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

            this.service.navigate({ 'url': 'app/payment/rent' });

          }

        });

      }

    })
    
  }

}

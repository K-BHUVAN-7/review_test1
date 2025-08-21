import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import * as _ from 'lodash';
import moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pay-payment-reverse',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './pay-payment-reverse.component.html',
  styleUrls: ['./pay-payment-reverse.component.scss']
})

export class PayPaymentReverseComponent implements OnInit {

  constructor(private fb: FormBuilder, public service: CommonService, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) {}

  paymentReverseForm: FormGroup = new FormGroup({});
  editData: any = {};
  userDetails: any = {};
  formSubmitted: boolean = false;
  _: any = _;
  masterList: any = {};
  permissions: any = {};
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  queryParamsValue: any = {};
  mode: string = 'Create';
  filteredUnitList: any[] = [];
  filteredTenantList: any[] = [];
  tenantDisplayName: string = '';

  isAnySelected: boolean = false;

  selectedAmtDue: number = 0;
  selectedAmtPaid: number = 0;
  selectedAmtOuts: number = 0;
  selectedAmtReverse: number = 0;

  approvedBy: any = '';
  requestedBy: any = '';

  billTypeList = [
    { _id: 'rent', 'billType': 'Rent Payment' },
    { _id: 'deposit', 'billType': 'Deposit Payment' },
    { _id: 'propertyTax', 'billType': 'Property Tax Payment' },
    { _id: 'utility', 'billType': 'Utility Payment' },
  ]

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if (!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({ url: '/tickets/list', payload: { 'parentCompanyId': this.userDetails.parentCompanyId, '_id': this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

            this.loadForm();

          }

        });

      } else {

        this.mode = 'Create';

        // this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr:["Payment", 'Payment Reverse'], isNeedBranchList: true, permission: ['create', 'view', 'edit', 'delete', 'approve'] });

    this.masterList = {

      companyList: this.permissions.viewPermission?.companyList || [],

      branchList: this.permissions.viewPermission?.branchList || []

    };

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');
    
    this.loadForm();

    this.getAllDetails();

    // this.getPaymentEntryList();

  }

  getAllDetails() {

    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        url: '/property/list', 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId }, 
        
        loaderState: true 
      
      }),

      'unitList': this.service.postService({

        'url': '/unit/list', 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },

        'loaderState': true

      }),

      'tenant': this.service.postService({ 
        
        url: '/otherUser/list',

        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant', is_active: true },

        'loaderState': true

      })

    }).subscribe({

      next: (res: any) => {

        if (res.propertyList?.status == 'ok') {
        
          if (this.userDetails.userType == 'manager' || this.userDetails.userType == 'owner') {

            let allowedPropertyIds = _.map(this.userDetails.propertyIds);

            this.masterList['propertyList'] = _.filter(res.propertyList.data, (propertyList: any) =>

              _.includes(allowedPropertyIds, propertyList._id)

            );

          } else {

            this.masterList['propertyList'] = res.propertyList.data;

          }

        }

        if (res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if (res.tenant?.status == 'ok') this.masterList['tenantList'] = res.tenant.data || [];

        if (this.mode == 'Update') this.loadForm();

      }

    });

  }

  loadForm() {

    this.formSubmitted = false;

    let edit = this.editData;

    let user = this.userDetails;

    let docDate = new Date();

    this.paymentReverseForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],
      
      'docDate': [ moment(docDate).format('DD-MM-YYYY') ],

      'billType': [ edit?.billType || null, Validators.required ],

      'fromDate': [ moment(docDate), Validators.required ],

      'toDate': [ moment(docDate), Validators.required ],

      'property': [ edit?.property?._id || null ],

      'unit': [ edit?.unit?._id || null ],

      // 'tenantName': [ edit?.tenantName?._id || null, Validators.required ] ,

      // 'paymentData': [ edit?.paymentData || null, Validators.required ],

      'amountDue': [ edit?.amountDue || 0 , Validators.required ],

      'amountPaid': [ edit?.amountPaid || 0, Validators.required ],

      'amountOutstanding': [ edit?.amountOutstanding || 0, Validators.required ],

      'paymentEntries': this.fb.array([])

    });

    // Mode Update
    if (this.mode == 'Update') {

      this.pl.clear();

      _.forEach(edit?.paymentEntries, (item: any) => {

        this.pl.push(this.getPaymentListForm({ value: item }));

      });

      this.changeValue('propertyName');

      const selectedUnitId = edit?.unit?._id;

      if (selectedUnitId) {

        const selectedUnit = _.find(this.masterList['unitList'], { _id: selectedUnitId });

        const tenantId = selectedUnit?.tenantId?._id;

        this.filteredTenantList = tenantId ? _.filter(this.masterList['tenantList'], { _id: tenantId }) : [];

        const tenantExists = _.some(this.filteredTenantList, { _id: tenantId });

        this.paymentReverseForm.patchValue({

          'tenantName': tenantExists ? tenantId : null

        });

        const tenant = _.find(this.masterList['tenantList'], { _id: tenantId });

        this.tenantDisplayName = tenant ? `${tenant.firstName} ${tenant.lastName}` : '';

      }

    }

    // Unit Change
    this.paymentReverseForm.get('unit')?.valueChanges.subscribe((unitId: string) => {

      if (unitId) {

        const selectedUnit = _.find(this.masterList['unitList'], { _id: unitId });

        const tenantId = selectedUnit?.tenantId?._id;

        const tenant = _.find(this.masterList['tenantList'], { _id: tenantId });

        this.filteredTenantList = tenant ? [tenant] : [];

        this.paymentReverseForm.patchValue({

          'tenantName': tenantId || null

        });

        this.tenantDisplayName = tenant ? `${tenant.firstName} ${tenant.lastName}` : '';

      } else {

        this.filteredTenantList = [];

        this.paymentReverseForm.patchValue({ tenantName: null });

        this.tenantDisplayName = '';

      }

      // this.getRentDetails();

      // this.getUtilityDetails();

    });

    this.paymentReverseForm?.get('fromDate')?.valueChanges.subscribe((date) => {

      this.getPaymentEntryList();

    });

    this.paymentReverseForm?.get('toDate')?.valueChanges.subscribe((date) => {

      this.getPaymentEntryList();

    });

    // Payment Change
    // this.paymentReverseForm.get('paymentData')?.valueChanges.subscribe((PaymentId: string) => {

    //   if (this.paymentReverseForm.get('billType')?.value == 'rent') {

    //     this.pl.clear();
  
    //     let data = this.masterList['detailRentList'];

    //     this.paymentReverseForm.patchValue({

    //       'amountDue': data[0].amountDue,

    //       'amountPaid': data[0].amountPaid,

    //       'amountOutstanding':  data[0].amountOutstanding

    //     })

    //     data = _.flatten( _.map(data, e => _.filter(e.paymentEntries || [], entry => entry.isApproved == true && entry.billType != 'reverse' && entry.revisedAmount == 0 )));
  
    //     _.forEach(data, (entry: any) => { this.pl.push(this.getPaymentListForm({ pay: entry })); });
                
    //   } else if (this.paymentReverseForm.get('billType')?.value == 'utility') {

    //     this.pl.clear();

    //     let data = this.masterList['detailUtilityList'];

    //     this.paymentReverseForm.patchValue({

    //       'amountDue': data[0].amountDue,

    //       'amountPaid': data[0].amountPaid,

    //       'amountOutstanding':  data[0].amountOutstanding

    //     })

    //     data = _.flatten( _.map(data, e => _.filter(e.paymentEntries || [], entry => entry.isApproved == true && entry.billType != 'reverse' && entry.revisedAmount == 0 )));

    //     _.forEach(data, (entry: any) => { this.pl.push(this.getPaymentListForm({ pay: entry })); });
        
    //   }

    //   // this.pl.clear();

    //   // if (rentPaymentId) {

    //   //   const selectedRent = _.find(this.masterList['detailRentList'], { _id: rentPaymentId });

    //   //   if (selectedRent?.paymentEntries?.length > 0) {

    //   //     _.forEach(selectedRent.paymentEntries, (entry: any) => {

    //   //       this.pl.push(this.getPaymentListForm({ pay: entry }));

    //   //     });

    //   //   } else {

    //   //     this.pl.push(this.getPaymentListForm({}));

    //   //   }

    //   // } else {

    //   //   this.pl.push(this.getPaymentListForm({}));

    //   // }

    //   updateTotals();

    // });

    // Utility Payment Change
    // this.paymentReverseForm.get('utilityPayment')?.valueChanges.subscribe((utilityPaymentId: string) => {
      
    //    this.pl.clear();

    //     let data = this.masterList['detailUtilityList'];

    //     data = _.flatten( _.map(data, e => _.filter(e.paymentEntries || [], entry => entry.isApproved == true && entry.billType != 'reverse' && entry.revisedAmount == 0 )));

    //     _.forEach(data, (entry: any) => { this.pl.push(this.getPaymentListForm({ pay: entry })); });
        
    //     console.log('Data', data);


    //   updateTotals();

    // });

    // Tenant Value Changes
    this.paymentReverseForm?.get('tenantName')?.valueChanges.subscribe((tenantId: any) => {
    
      // this.getRentDetails();

      // this.getUtilityDetails();
    
    });

    let updateTotals = () => {

      let selectedEntries = _.filter(this.pl.getRawValue(), (entry: any) => entry.isSelected);

      this.selectedAmtDue = _.sumBy(selectedEntries, (entry: any) => parseFloat(entry.amountDue) || 0);

      this.selectedAmtPaid = _.sumBy(selectedEntries, (entry: any) => parseFloat(entry.amountPaid) || 0);

      this.selectedAmtOuts = _.sumBy(selectedEntries, (entry: any) => parseFloat(entry.amountOutstanding) || 0);

      this.selectedAmtReverse = _.sumBy(selectedEntries, (entry: any) => parseFloat(entry.reverseAmt) || 0);

      this.isAnySelected = this.pl.controls.some(control => control.get('isSelected')?.value == true);

    }

    updateTotals();

    this.pl.valueChanges.subscribe(() => {

      // this.isAnySelected = this.pl.controls.some(control => control.get('isSelected')?.value == true);

      updateTotals();

    });

    this.pl.controls.forEach(control => {

      control.get('isSelected')?.valueChanges.subscribe(() => { updateTotals(); });

    });

  }

  isBillSelected(id: string, controlName: string): boolean {

    let selected = this.paymentReverseForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  getPaymentEntryList() {

    let payload: any = this.paymentReverseForm.getRawValue();

    payload = _.pick(payload, ['parentCompanyId', 'companyId', 'branchId', 'billType', 'fromDate', 'toDate', 'property', 'unit']);

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['fromDate', 'toDate']});

    this.service.postService({ url: '/payment/entries', payload }).subscribe({

      next: (res: any) => {

        if (res.status == 'ok') { 

          this.masterList['paymentEntryList'] = res.data;

          this.constructFormArray();

          console.log('Payment Entry List', this.masterList['paymentEntryList']);

        } else {

          this.masterList['paymentEntryList'] = [];

        }

      }

    });

  }

  constructFormArray() {

    let data = this.masterList['paymentEntryList'];

    this.pl.clear();

    _.forEach(data, (item: any) => {

      this.pl.push(this.getPaymentListForm({ value: item }));

    });

  }

  getPaymentListForm({ value = {}, }: {value?: any,}) : FormGroup  {

    return this.fb.group({

      'isSelected': [ value?.isSelected || false ],

      'paymentId': [ value?._id || null ],

      'billId': [ value?.billId?._id || null ],

      'property': [ value.property?._id || '' ],

      'propertyDet': [ value.property?.propertyName || '' ],

      'unit': [ value.unit?._id || '' ],

      'unitDet': [ value.unit?.unitName || '' ],

      'billType': [ value.billType || '-' ],

      'approvedBy': [ value.approvedBy?._id || '-' ],

      'appprovedDet': [ value.approvedBy?.firstName || '' ],

      'requestedBy': [ value.requestedBy?._id || '-' ],

      'requestedDet': [ value.requestedBy?.firstName || ''],

      'paymentDate': [ (value?.paymentDate ? moment(value.paymentDate).format('YYYY-MM-DD') : '') || '-' ],

      'amountDue': [ value?.amountDue || 0 ],

      'amountPaid': [ value?.amountPaid || 0 ],

      'amountOutstanding': [ value?.amountOutstanding || 0 ],
      
      'reverseAmt': [ value?.reverseAmt || 0 ]

    });

  }

  reverseAmountValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      let formGroup = control as FormGroup;
      
      if (!formGroup.controls) {

        return null; 

      }

      let isSelected = formGroup.get('isSelected')?.value;

      let amount = formGroup.get('reverseAmt')?.value;

      let amountPaid = formGroup.get('amountPaid')?.value;

      if ( isSelected && amount != null && amountPaid != null && !isNaN(parseFloat(amount.toString())) && !isNaN(parseFloat(amountPaid.toString())) ) {

        let amountNum = parseFloat(amount.toString()).toFixed(2);

        let amountPaidNum = parseFloat(amountPaid.toString()).toFixed(2);

        if (parseFloat(amountNum) <= 0) {

          return { reverseAmountNonPositive: 'Reverse amount must be greater than 0' };

        }

        if (parseFloat(amountNum) > parseFloat(amountPaidNum)) {

          return {

            reverseAmountExceedsPaid: `Exceeds paid amount ${amountPaidNum}`

          };

        }

      }

      return null;

    };

  }

  get f(): any { return this.paymentReverseForm.controls; }

  get pl(): FormArray { return this.paymentReverseForm.controls['paymentEntries'] as FormArray; }

  changeValue(fieldName?: string, index = -1 ) {

    if(index > -1) var itemRowValue = this.pl.at(index)?.value;

    if (fieldName == 'propertyName') {

      let selectedPropertyId = Array.isArray(this.f.property.value) ? this.f.property.value[0] : this.f.property.value; this.filteredUnitList = _.filter(this.masterList ['unitList'], (unit: any) => {

        return unit?.propertyName?._id == selectedPropertyId;

      });

      if (this.mode == 'Update' && this.editData?.unit?._id) {

        let validUnit = _.find(this.filteredUnitList, { _id: this.editData.unit._id });

        this.f.unit.setValue(validUnit ? validUnit._id : null);

      } else {

        this.f.unit.setValue(null);

      }

    }

    if(fieldName = 'selectPayment') {

      itemRowValue = this.pl.at(index)?.value

      if(itemRowValue?.isSelected == true) {

        this.pl.at(index)?.patchValue({ 'reverseAmt': itemRowValue.amountPaid})        

      } else {

        this.pl.at(index)?.patchValue({ 'reverseAmt': 0 })
      }

    } 

  }

  onSubmit() {

    this.formSubmitted = true;

    if (this.paymentReverseForm?.invalid) return;

    let payload = this.paymentReverseForm.getRawValue();

    let params: any;

    // payload['reverseAmt'] = this.selectedAmtReverse;

    if (this.paymentReverseForm.get('billType')?.value == 'rent') {

      params = { type: 'rent'}

      // payload['_id'] = this.paymentReverseForm.value.paymentData
      
    } else if(this.paymentReverseForm.get('billType')?.value == 'utility') {

      params = { type: 'utility'}

      // payload['_id'] = this.paymentReverseForm.value.paymentData
      
    }

    if (this.permissions?.approvePermission?.branchIds?.length > 0) {

      payload['isApprovalUser'] = true;

    } else {

      payload['isApprovalUser'] = false;

    }

    payload['paymentEntries'] = _.filter(payload['paymentEntries'], (entry: any) => entry.isSelected);

    payload['paymentEntries'] = _.map(payload['paymentEntries'], (entry: any) => _.omit(entry, [ 'isSelected', 'approvedDate', 'requestedDate', 'approvedBy', 'appprovedDet', 'requestedBy', 'requestedDet', 'propertyDet', 'unitDet']) );

    payload = _.omit(payload, ['tenantName', 'billType', 'fromDate', 'toDate', 'amountDue', 'amountPaid', 'amountOutstanding', 'property', 'unit']);

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['docDate']});

    // payload = { ...payload, 'amountDue': payload['paymentEntries'][0]?.amountDue, 'amountPaid': (this.selectedAmtPaid - this.selectedAmtReverse), 'amountOutstanding': (this.selectedAmtOuts + this.selectedAmtReverse), 'reverseAmt': this.selectedAmtReverse }
    
    console.log('Payload', payload);

    // return;

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.postService({ url: `/payment/reverse`, params, payload }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.formSubmitted = false;

            this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

            this.service.navigate({ 'url': 'app/payment/reverse' });

          }

        });

      }

    })
    
  }

  close() {

    this.service.navigate({ url: 'app/payment/reverse' });

  }

}
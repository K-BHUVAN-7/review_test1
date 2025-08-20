import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-payment-reverse',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './payment-reverse.component.html',
  styleUrl: './payment-reverse.component.scss'
})
export class PaymentReverseComponent {

  @ViewChild('reverseApproveModal') reverseApproveModal!: TemplateRef<any>;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private fb: FormBuilder, private modalService: NgbModal) { } 
  
  filterForm: FormGroup = new FormGroup({});
  masterList: any = {};
  mode: any = 'Create'
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  selectedData: any = {};
  selectPaymentEntry: any = {};
  modalRef!: NgbModalRef;

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  unitSliderMin = 0;
  unitSliderMax = 50;
  unitMinValue = 0;
  unitMaxValue = 50;

  statusOptions = [
    { label: 'All', checked: true, value: null },
    { label: 'Active', value: true, checked: true },
    { label: 'Inactive', value: false, checked: true },
  ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", "Payment Reverse"], isNeedBranchList: true, 'permission': ['create','view','edit','delete','approve']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');
    
    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getPaymentReverseList();

    this.initForm();

    // this.getAllDetails();
    
  }

  initForm(){
  
    this.filterForm = this.fb.group({

      'propertyName': "",

      'unitName': "",

      // 'unitMin': [this.unitMinValue],
    
      // 'unitMax': [this.unitMaxValue],

      'status': [] ,

    });

    this.getPaymentReverseList();

  }

  checkboxFilterChange({ event = {}, isAll = false, fieldName = 'status' } : { event: any, isAll: boolean, fieldName: any }) {

    let array: any = [];

    if(fieldName == 'status') array = this.statusOptions;

    if(isAll) this.service.changeSelectAll(event,array);

    else array[0]['checked'] = _.every(_.filter(array,(e)=>e.label != 'All'), 'checked');
    
    let arr = _.map(_.filter(array,'checked'), "value");

    this.filterForm.get(fieldName)?.setValue(arr.includes(null) ? [] : arr);

  }

  isSelected(controlName: string, id: string): boolean {

    let selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  getAllDetails(){
  
    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.unitList?.status == 'ok') {

          if (this.userDetails?.userType == 'owner' || this.userDetails?.userType == 'manager') {
          
            this.masterList['unitList'] = _.filter(res.unitList?.data, (unit: any) =>
  
              _.includes(this.userDetails?.propertyIds, unit?.propertyName?._id)
  
            );
  
          } else {
  
            this.masterList['unitList'] = res.unitList?.data;
  
          }

        } 
        
      }
  
    });

  }

  isAnyBillNotApproved(paymentEntries: any[]): boolean {

    return paymentEntries.some(entry => !entry.isApproved && !entry.isRejected);

  }

  areAllBillsApproved(paymentEntries: any[]): boolean {

    return paymentEntries.length > 0 && paymentEntries.every(entry => entry.isApproved);
  
  }

  shouldShowApproveButton(rent: any): boolean {

    const hasPending = !rent?.isApproved && !rent?.isRejected;

    return this.permissions?.approvePermission?.branchList?.length > 0 && hasPending;

  }

  shouldShowApprovePending(rent: any): boolean {

    const hasPending = !rent?.isApproved && !rent?.isRejected;

    return this.permissions?.approvePermission?.branchList?.length === 0 && hasPending;

  }

  shouldShowPayButton(rent: any): boolean {

    if (rent.amountPaid >= rent.amountDue) return false;

    if (Array.isArray(rent?.paymentEntries)) {

      if (rent.paymentEntries.length === 0) return true;

      return this.areAllBillsApproved(rent.paymentEntries);

    } else {

      return rent?.isApproved || false;

    }

  }

  openModal(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/payment/reverse/pay-payment-reverse', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/payment/reverse/pay-payment-reverse' }); 
        
    }
      
  }
   
  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getPaymentReverseList();
  
  }

  getPaymentReverseList() {

    if(_.size(this.masterList['companyList']) > 1) {
    
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, billType: 'reverse' };

    this.service.postService({ url: '/payment/reverse/list', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['paymentReverseList'] = res.data;

        this.totalCount = _.get(res, 'data.totalCount', _.get(res, 'totalCount', 0));

      }

    });

  }

  openReverseApproveModal(data?: any) {

    this.selectedData = data;

    this.selectPaymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    this.modalRef = this.modalService.open(this.reverseApproveModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
  }

  approveRent(data?: any) {

    let payload: any = data;

    payload = { ...data, isApproved: true, isApprovalUser: true, 'property': data.property?._id, 'unit': data.unit?._id, 'reversePaymentId': data.reversePaymentId?._id };

    payload = _.omit(payload, ['_id']);

    let params: any = { 'type': 'reverse' };
    
    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['docDate', 'paymentDate', 'requestedDate']});

    console.log('Payload', payload);

    // return;

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Approve this document?",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${data?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ data: { message: 'Approved Successfully', type: 'success' } });

            // this.service.navigate({ url: 'app/payment/rent' });

            this.modalRef.close();

          }

        });

      }

    })

  }

  rejectRent(data?: any) {

    let payload: any = data;

    payload = { ...data, isRejected: true, isApprovalUser: true, 'property': data.property?._id, 'unit': data.unit?._id, 'reversePaymentId': data.reversePaymentId?._id };

    payload = _.omit(payload, ['_id']);

    let params: any = { 'type': 'reverse' };

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['docDate', 'paymentDate', 'requestedDate']});

    console.log('Payload', payload);

    // return;

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Reject this document?",

      type: "info",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${data?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ "data": { "message": `Rejected Successfully`, "type": "success" } });

            // this.service.navigate({ 'url': 'app/payment/rent' });

            this.modalRef.close();

          }

        });

      }

    })

  }



















  deletePaymentReverse(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title: 'Delete' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/otherUser/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getPaymentReverseList();

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getPaymentReverseList();

          }

        });

      }

    });

  }

  xlDownload(){
  
    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;
    }

    let params =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff'  };

    this.service.getFile({ "url": "/getStaffExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Staff List.xlsx';

      a.click();

    });

  }

}
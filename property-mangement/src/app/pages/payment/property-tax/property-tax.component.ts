import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-property-tax',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './property-tax.component.html',
  styleUrl: './property-tax.component.scss'
})
export class PropertyTaxComponent {
  
  @ViewChild('propertyTaxHistory') propertyTaxHistory!: TemplateRef<any>;

  @ViewChild('propertyTaxApproveModal') propertyTaxApproveModal!: TemplateRef<any>;
  
  constructor(public service: CommonService, private fb: FormBuilder, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal) { } 
    
  masterList: any = {};
  mode: any = 'Create'
  permissions : any = {}
  userDetails : any  = {};
  _: any = _;
  filterForm: FormGroup = new FormGroup({});

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  modalRef!: NgbModalRef;
  selectedData: any = {};
  selectPaymentEntry: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  taxAmtSliderMin = 0;
  taxAmtSliderMax = 100000;
  taxAmtMinValue = 0;
  taxAmtMaxValue = 100000;

  paidAmtSliderMin = 0;
  paidAmtSliderMax = 100000;
  paidAmtMinValue = 0;
  paidAmtMaxValue = 100000;

  outsAmtSliderMin = 0;
  outsAmtSliderMax = 100000;
  outsAmtMinValue = 0;
  outsAmtMaxValue = 100000;

  statusOptions = [
    { label: 'notYetDue', value: 'Not Yet Due', checked: true },
    { label: 'overdue', value: 'Overdue', checked: true },
    { label: 'paid', value: 'Paid', checked: true },
  ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Property Tax'], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete', 'approve']});

    console.log('Permissions', this.permissions);
    
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId')

    this.getPropertyTaxList();

    this.getAllDetails();

    this.initForm();

  }

  isAnyBillNotApproved(paymentEntries: any[]): boolean {

    return paymentEntries.some(entry => !entry.isApproved && !entry.isRejected);

  }

  areAllBillsApproved(paymentEntries: any[]): boolean {

    return paymentEntries.length > 0 && paymentEntries.every(entry => entry.isApproved);

  }

  shouldShowApproveButton(rent: any): boolean {

    const hasPending = this.isAnyBillNotApproved(rent?.paymentEntries);

    return this.permissions?.approvePermission?.branchList?.length > 0 && hasPending;

  }

  shouldShowApprovePending(rent: any): boolean {

    const hasPending = this.isAnyBillNotApproved(rent?.paymentEntries);

    return this.permissions?.approvePermission?.branchList?.length == 0 && hasPending;

  }

  shouldShowPayButton(rent: any): boolean {

    if (rent.amountPaid >= rent.amountDue) return false;

    if (!rent.paymentEntries || rent.paymentEntries.length == 0) return true;

    return !this.isAnyBillNotApproved(rent.paymentEntries);

  }
  
  initForm(){
  
    this.filterForm = this.fb.group({

      'property': "",

      'unit': "",
      
      'dueStartDate': '',
      
      'dueEndDate': '',
      
      'paymentStartDate': '',
      
      'paymentEndDate': '',
      
      'taxMin': [this.taxAmtMinValue],

      'taxMax': [this.taxAmtMaxValue],

      'paidMin': [this.paidAmtMinValue],

      'paidMax': [this.paidAmtMaxValue],

      'outsMin': [this.outsAmtMinValue],

      'outsMax': [this.outsAmtMaxValue],

    });

    // this.getPropertyTaxList();

  }

  onTaxAmtSliderChange() {

    if (this.taxAmtMinValue > this.taxAmtMaxValue) {
    
      [this.taxAmtMinValue, this.taxAmtMaxValue] = [this.taxAmtMaxValue, this.taxAmtMinValue];
    
    }

    let minPercent = ((this.taxAmtMinValue - this.taxAmtSliderMin) / (this.taxAmtSliderMax - this.taxAmtSliderMin)) * 100;
    
    let maxPercent = ((this.taxAmtMaxValue - this.taxAmtSliderMin) / (this.taxAmtSliderMax - this.taxAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.tax-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'taxMin': this.taxAmtMinValue,
    
      'taxMax': this.taxAmtMaxValue
    
    });

  }

  onPaidAmtSliderChange() {

    if (this.paidAmtMinValue > this.paidAmtMaxValue) {
    
      [this.paidAmtMinValue, this.paidAmtMaxValue] = [this.paidAmtMaxValue, this.paidAmtMinValue];
    
    }

    let minPercent = ((this.paidAmtMinValue - this.paidAmtSliderMin) / (this.paidAmtSliderMax - this.paidAmtSliderMin)) * 100;
    
    let maxPercent = ((this.paidAmtMaxValue - this.paidAmtSliderMin) / (this.paidAmtSliderMax - this.paidAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.paid-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
      
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'paidMin': this.paidAmtMinValue,
      
      'paidMax': this.paidAmtMaxValue
      
    });

  }

  onOutsAmtSliderChange() {

    if (this.outsAmtMinValue > this.outsAmtMaxValue) {
    
    [this.outsAmtMinValue, this.outsAmtMaxValue] = [this.outsAmtMaxValue, this.outsAmtMinValue];
    
    }

    let minPercent = ((this.outsAmtMinValue - this.outsAmtSliderMin) / (this.outsAmtSliderMax - this.outsAmtSliderMin)) * 100;
    
    let maxPercent = ((this.outsAmtMaxValue - this.outsAmtSliderMin) / (this.outsAmtSliderMax - this.outsAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.outs-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
    slider.style.setProperty('--start', `${minPercent}%`);
    
    slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
    'outsMin': this.outsAmtMinValue,
    
    'outsMax': this.outsAmtMaxValue
    
    });

  }

  getAllDetails(){
  
    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'utilities': this.service.postService({ 
        
        "url": "/master/utility/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
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
        
        // if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.utilities?.status == 'ok') this.masterList['utilityList'] = res.utilities.data || [];

        // this.loadForm();

      }
  
    });

  }

  isSelected(controlName: string, id: string): boolean {

    let selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  onPageChange(event: PageEvent): void {
    
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getPropertyTaxList();
  
  }

  openHistoryModal(data?: any) {

    this.modalService.open(this.propertyTaxHistory, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

    this.masterList['taxHistoryList'] = data.paymentEntries;

  }

  openPayPropertyTaxModal(data?: any){  

    console.log('Data Value', data);

    this.service.navigate({ 'url': 'app/payment/tax/pay-property-tax', queryParams: { id: data } });

  }
  
  getPropertyTaxList(){

    if(_.size(this.masterList['companyList'])>1) {
              
      this.companyId = _.map(this.masterList['companyList'], 'companyId')
  
    } else {

      this.companyId =  this.companyId;

    }
  
    let filterValues = _.pickBy(this.filterForm.getRawValue());
  
    this.service.changePayloadDateFormat({'data': filterValues, 'fields': [ 'dueStartDate', 'dueEndDate', 'paymentStartDate', 'paymentEndDate' ]})

    if (_.includes(filterValues['status'], true)) {

      filterValues['is_active'] = true;

    }  else {

      _.isEmpty(filterValues['status']) ? '' : filterValues['is_active'] = false;

    }

    let selectedStatuses = _.map(_.filter(this.statusOptions, { checked: true }), 'value');

    let allChecked = _.every(this.statusOptions, { checked: true });

    if (!allChecked) {

      filterValues['status'] = selectedStatuses;

    } else {

      filterValues = _.omit(filterValues, 'status');

    }

    let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unit': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'propertyIds': this.userDetails?.propertyIds };

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };    

    // this.service.postService({'url': '/payment/propertyTax/list', payload, params }).subscribe((res: any) => {

    this.service.postService({'url': '/property-Tax-bill/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['propertyTaxList'] = res.data;

        console.log('Property Tax List', this.masterList['propertyTaxList']);

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  getPropertyTaxStatus(item: any): string {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(item?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = item?.utilityAmount ?? item?.taxAmount ?? 0;

    let amountPaid = item?.amountPaid ?? 0;

    if (amountPaid >= amountDue && amountDue > 0) {

      return 'Paid';

    }

    let dueMonth = dueDate.getMonth();

    let dueYear = dueDate.getFullYear();

    let currentMonth = today.getMonth();

    let currentYear = today.getFullYear();

    if (dueYear == currentYear && dueMonth == currentMonth) {

      if (dueDate >= today) return 'Upcoming';

      else return 'Overdue';

    }

    if (dueDate > today) return 'Not yet Due';

    return 'Overdue';

  }

  openPropertyTaxApproveModal(data?: any) {
    
    this.selectedData = data;

    this.selectPaymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    this.modalRef = this.modalService.open(this.propertyTaxApproveModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
  }

  approvePropertyTax(data?: any) {
  
    let paymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    let updatedPaymentEntry = { ..._.omit(paymentEntry, ['_id', 'requestedBy', 'revisedAmount', 'reverseAmt', 'paymentReverse', 'invoiceNo', 'billId', 'billType', ]), isApproved: true, isApprovalUser: true };

    let payload: any = updatedPaymentEntry;

    let params: any = { 'type': 'utility' };
    
    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['paymentDate']});

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Approve this document?",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${paymentEntry?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ data: { message: 'Approved Successfully', type: 'success' } });

            this.service.navigate({ url: 'app/payment/property-tax' });

            this.modalRef.close();

          }

        });

      }

    })

  }
  
  rejectPropertyTax(data?: any) {

    let paymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    let updatedPaymentEntry = { ..._.omit(paymentEntry, ['_id', 'requestedBy', 'revisedAmount', 'reverseAmt', 'paymentReverse', 'invoiceNo', 'billId', 'billType']), isRejected: true, isApprovalUser: true };

    let payload: any = updatedPaymentEntry;

    let params: any = { 'type': 'utility' };
    
    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['paymentDate']});

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Reject this document?",

      type: "info",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${paymentEntry?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ "data": { "message": `Rejected Successfully`, "type": "success" } });

            this.service.navigate({ 'url': 'app/payment/property-tax' });

            this.modalRef.close();

          }

        });

      }

    })

  }

}

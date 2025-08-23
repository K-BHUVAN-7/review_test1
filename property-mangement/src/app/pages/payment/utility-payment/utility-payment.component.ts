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
  selector: 'app-utility-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './utility-payment.component.html',
  styleUrl: './utility-payment.component.scss'
})
export class UtilityPaymentComponent {

  @ViewChild('utilityPaymentHistoryModal') utilityPaymentHistoryModal!: TemplateRef<any>;
    
  @ViewChild('utilityApprovelModal') utilityApprovelModal!: TemplateRef<any>;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private fb: FormBuilder,  private route: ActivatedRoute) { } 
    
  masterList: any = {};
  mode: any = 'Create'
  permissions : any = {}
  userDetails : any  = {};
  _: any = _;
  modalRef!: NgbModalRef;
  selectedData: any = {};
  selectPaymentEntry: any = {};

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  filterForm: FormGroup = new FormGroup({});

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  utilityAmtSliderMin = 0;
  utilityAmtSliderMax = 100000;
  utilityAmtMinValue = 0;
  utilityAmtMaxValue = 100000;

  statusOptions = [
    { label: 'Not Yet Due', value: 'notYetDue', checked: true },
    { label: 'Overdue', value: 'overdue', checked: true },
    { label: 'Paid', value: 'paid', checked: true },
  ];
  
  ngOnInit(): void {
    
    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Utility Payment'], isNeedBranchList: true, 'permission': ['create','view','edit','delete', 'approve']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList':  this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getUtilityPaymentList();

    this.getAllDetails();

    this.initForm();
    
  }

  initForm(){
  
    this.filterForm = this.fb.group({

      'property': "",

      'unit': "",

      'utility': "",

      'utilityMin': [this.utilityAmtMinValue],

      'utilityMax': [this.utilityAmtMaxValue],

      // 'billStartDate': '',
      
      // 'billEndDate': '',

      'dueStartDate': '',
      
      'dueEndDate': '',

    });

    this.getUtilityPaymentList();

  }

  onAmountSliderChange() {

    if (this.utilityAmtMinValue > this.utilityAmtMaxValue) {
    
      [this.utilityAmtMinValue, this.utilityAmtMaxValue] = [this.utilityAmtMaxValue, this.utilityAmtMinValue];
    
    }

    let minPercent = ((this.utilityAmtMinValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;
    
    let maxPercent = ((this.utilityAmtMaxValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.amount-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'utilityMin': this.utilityAmtMinValue,
    
      'utilityMax': this.utilityAmtMaxValue
    
    });

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

  getAllDetails(){
  
    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
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
  
        // if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];
        
        // if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.utilities?.status == 'ok') this.masterList['utilityList'] = res.utilities.data || [];

        
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

        if(res.unitList?.status == 'ok') {
        
          if (this.userDetails?.userType == 'owner' || this.userDetails?.userType == 'manager') {
          
            this.masterList['unitList'] = _.filter(res.unitList?.data, (unit: any) =>
  
              _.includes(this.userDetails?.propertyIds, unit?.propertyName?._id)
  
            );
  
          } else {
  
            this.masterList['unitList'] = res.unitList?.data;
  
          }

        } 

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
  
    this.getUtilityPaymentList();
  
  }
 
  getUtilityPaymentList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());
  
    this.service.changePayloadDateFormat({'data': filterValues, 'fields': ['billStartDate', 'billEndDate', 'dueStartDate', 'dueEndDate' ]})

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

    let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true, ...filterValues };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unit': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'propertyIds': this.userDetails?.propertyIds };

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };    

    this.service.postService({'url': '/utility-bill/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['utilityPaymentList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;
        
      }

    });

  }

  openHistoryModal(data?: any) {

    this.modalService.open(this.utilityPaymentHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

    this.masterList['utilityHistoryList'] = data.paymentEntries;

  }
  
  openUtilityAmtModal(data?: any){

    this.service.navigate({ 'url': 'app/payment/utility/pay-utility', queryParams: { id: data }  }); 
        
  }

  getUtilityStatus(item: any): string {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(item?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = item?.amountDue ?? item?.taxAmount ?? 0;

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

  openUtilityApprovelModal(data?: any) {
  
    this.selectedData = data;

    this.selectPaymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    this.modalRef = this.modalService.open(this.utilityApprovelModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
  }

  approveUtility(data?: any) {
  
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

            this.getUtilityPaymentList();

            // this.service.navigate({ url: 'app/payment/utility' });

            this.modalRef.close();

          }

        });

      }

    })

  }
  
  rejectUtility(data?: any) {

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

            // this.service.navigate({ 'url': 'app/payment/utility' });

            this.getUtilityPaymentList();

            this.modalRef.close();

          }

        });

      }

    })

  }

}

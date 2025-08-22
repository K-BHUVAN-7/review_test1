import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './rent.component.html',
  styleUrl: './rent.component.scss'
})
export class RentComponent {

  @ViewChild('detailHistoryModal') detailHistoryModal!: TemplateRef<any>;

  @ViewChild('rentApproveModal') rentApproveModal!: TemplateRef<any>;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private fb: FormBuilder) { } 
    
  masterList: any = {};
  mode: any = 'Create'
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  filterForm: FormGroup = new FormGroup({});

  contractAmtSliderMin = 0;
  contractAmtSliderMax = 100000;
  contractAmtMinValue = 100;
  contractAmtMaxValue =20000;

  amountDueSliderMin = 0;
  amountDueSliderMax = 100000;
  amountDueMinValue = 0;
  amountDueMaxValue = 100000;

  paymentReceivedSliderMin = 0;
  paymentReceivedSliderMax = 100000;
  paymentReceivedMinValue = 0;
  paymentReceivedMaxValue = 100000;

  outstandingSliderMin = 0;
  outstandingSliderMax = 100000;
  outstandingMinValue = 0;
  outstandingMaxValue = 100000;

  frequencyList: any = [
    { value: 'Monthly' },
    { value: 'Quarterly' },
    { value: 'Annually' },
  ]

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Rent'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getRentList();

    this.initForm();

    this.getAllDetails();
    
  }

  initForm(){
  
    this.filterForm = this.fb.group({

      'propertyName': "",

      'unitName': "",

      'tenantName': '',

      'rentalMin': [this.contractAmtMinValue],

      'rentalMax': [this.contractAmtMaxValue],
      
      'frequency': '',

      // // 'lastDueFromDate': '',

      // // 'lastDueToDate': '',

      // 'amountDueMin': [this.amountDueMinValue],
      
      // 'amountDueMax': [this.amountDueMaxValue],

      // 'paymentReceivedMin': [this.paymentReceivedMinValue],
      
      // 'paymentReceivedMax': [this.paymentReceivedMaxValue],

      // 'OutstandingMin': [this.outstandingMinValue],
      
      // 'OutstandingMax': [this.outstandingMaxValue]

    });

    // this.getRentList();

  }

  onContractAmtSliderChange() {

    if (this.contractAmtMinValue > this.contractAmtMaxValue) {
    
      [this.contractAmtMinValue, this.contractAmtMaxValue] = [this.contractAmtMaxValue, this.contractAmtMinValue];
    
    }

    let minPercent = ((this.contractAmtMinValue - this.contractAmtSliderMin) / (this.contractAmtSliderMax - this.contractAmtSliderMin)) * 100;
    
    let maxPercent = ((this.contractAmtMaxValue - this.contractAmtSliderMin) / (this.contractAmtSliderMax - this.contractAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.contractAmt-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'rentalMin': this.contractAmtMinValue,
    
      'rentalMax': this.contractAmtMaxValue
    
    });

  }

  onAmountDueSliderChange() {

    if (this.amountDueMinValue > this.amountDueMaxValue) {

      [this.amountDueMinValue, this.amountDueMaxValue] = [this.amountDueMaxValue, this.amountDueMinValue];

    }

    let minPercent = ((this.amountDueMinValue - this.amountDueSliderMin) / (this.amountDueSliderMax - this.amountDueSliderMin)) * 100;
    
    let maxPercent = ((this.amountDueMaxValue - this.amountDueSliderMin) / (this.amountDueSliderMax - this.amountDueSliderMin)) * 100;

    // Update only deposit sliders CSS
    let sliders = document.querySelectorAll('.amountDue-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'amountDueMin': this.amountDueMinValue,
    
      'amountDueMax': this.amountDueMaxValue
    
    });
  
  }

  onPaymentReceivedSliderChange() {

    if (this.paymentReceivedMinValue > this.paymentReceivedMaxValue) {

      [this.paymentReceivedMinValue, this.paymentReceivedMaxValue] = [this.paymentReceivedMaxValue, this.paymentReceivedMinValue];

    }

    let minPercent = ((this.paymentReceivedMinValue - this.paymentReceivedSliderMin) / (this.paymentReceivedSliderMax - this.paymentReceivedSliderMin)) * 100;
    
    let maxPercent = ((this.paymentReceivedMaxValue - this.paymentReceivedSliderMin) / (this.paymentReceivedSliderMax - this.paymentReceivedSliderMin)) * 100;

    // Update only deposit sliders CSS
    let sliders = document.querySelectorAll('.paymentReceived-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'paymentReceivedMin': this.paymentReceivedMinValue,
    
      'paymentReceivedMax': this.paymentReceivedMaxValue
    
    });
  
  }

  onOutstandingSliderChange() {

    if (this.outstandingMinValue > this.outstandingMaxValue) {

      [this.outstandingMinValue, this.outstandingMaxValue] = [this.outstandingMaxValue, this.outstandingMinValue];

    }

    let minPercent = ((this.outstandingMinValue - this.outstandingSliderMin) / (this.outstandingSliderMax - this.outstandingSliderMin)) * 100;
    
    let maxPercent = ((this.outstandingMaxValue - this.outstandingSliderMin) / (this.outstandingSliderMax - this.outstandingSliderMin)) * 100;

    // Update only deposit sliders CSS
    let sliders = document.querySelectorAll('.outstanding-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'OutstandingMin': this.outstandingMinValue,
    
      'OutstandingMax': this.outstandingMaxValue
    
    });
  
  }

  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
        'loaderState': true

      }),

      'tenantList': this.service.postService({ 
        
        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, userType: 'tenant', ...(this.userDetails.userType == 'tenant' ? { 'unitName': this.userDetails?.unitName } : {}), ...((this.userDetails.userType == 'manager' ||  this.userDetails.userType == 'owner') ? { 'tenantPropertyIds': this.userDetails?.propertyIds } : {}) },
        
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

        if(res.tenantList?.status == 'ok') this.masterList['tenantList'] = res.tenantList.data || [];

      }
  
    });

  }

  openRentApproveModal() {

    this.modalService.open(this.rentApproveModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });

  }

  openRentDetailsModal(data?: any) {

    this.service.navigate({ 'url': 'app/payment/rent/rent-details', queryParams: { 'tenantId': data?._id, 'unitId': data?.unitName?._id } });

  }

  getRentList(){
  
    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());
    
    // this.service.changePayloadDateFormat({'data': filterValues, 'fields': ['lastDueFromDate', 'lastDueToDate' ]})

    let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...filterValues };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unitName': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'tenantPropertyIds': this.userDetails?.propertyIds };

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url': '/otherUser/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['rentList'] = _.filter(res.data, item => !_.isEmpty(item.contractDetails));

        this.totalCount = res.data.totalCount || res.totalCount || 0;

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
  
    this.getRentList();
  
  }

}
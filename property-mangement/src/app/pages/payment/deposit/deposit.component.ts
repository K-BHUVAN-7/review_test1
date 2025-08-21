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
  selector: 'app-deposit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss'
})
export class DepositComponent {

  @ViewChild('paymentHistoryModal') paymentHistoryModal!: TemplateRef<any>;

  @ViewChild('refundHistoryModal') refundHistoryModal!: TemplateRef<any>;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private fb: FormBuilder) { } 
    
  masterList: any = {};
  mode: any = 'Create'
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  selectedData: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  filterForm: FormGroup = new FormGroup({});

  depositAmtSliderMin = 0;
  depositAmtSliderMax = 100000;
  depositAmtMinValue = 0;
  depositAmtMaxValue = 100000;

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Deposit'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                    
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList':  this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getDepositList();

    this.initForm();

    this.getAllDetails();
    
  }

  
  initForm(){
  
    this.filterForm = this.fb.group({

      'propertyName': "",

      'unitName': "",

      'depositMin': [this.depositAmtMinValue],

      'depositMax': [this.depositAmtMaxValue],
      
    });

    this.getDepositList();

  }

  onDepositAmtSliderChange() {

    if (this.depositAmtMinValue > this.depositAmtMaxValue) {
    
      [this.depositAmtMinValue, this.depositAmtMaxValue] = [this.depositAmtMaxValue, this.depositAmtMinValue];
    
    }

    let minPercent = ((this.depositAmtMinValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;
    
    let maxPercent = ((this.depositAmtMaxValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.contractAmt-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'depositMin': this.depositAmtMinValue,
    
      'depositMax': this.depositAmtMaxValue
    
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
          
          payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, userType: 'tenant', ...(this.userDetails.userType == 'tenant' ? { 'unitName': this.userDetails?.unitName } : {}), ...((this.userDetails.userType == 'manager' || this.userDetails.userType == 'owner') ? { 'propertyIds': this.userDetails?.propertyIds } : {}) },
          
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
  
  openPaymentHistoryModal(data?: any) {

    this.selectedData = data;

    let entries = _.get(this.selectedData, 'paymentEntries', []);

    this.masterList['receiveHistory'] = _.filter(entries, { billType: 'deposit_receive' });

    this.modalService.open(this.paymentHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

  openRefundHistoryModal(data?: any) {

    this.selectedData = data;

    let entries = _.get(this.selectedData, 'paymentEntries', []);

    this.masterList['refundHistory'] = _.filter(entries, { billType: 'deposit_refund' });

    this.modalService.open(this.refundHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

  openReceiveModal(data?:any){

    this.service.navigate({ 'url': 'app/payment/deposit/receive', queryParams: { id: data } });

  }
  
  openRefundModal(data?:any){

    let queryParams = { 'id': data };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/payment/deposit/refund', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/payment/deposit/refund' }); 
        
    }
      
  }

  getDepositList() {

    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...filterValues };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unit': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'propertyIds': this.userDetails?.propertyIds };

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ url: '/payment/deposit/list', payload, params }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['depositList'] = res.data || [];

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
  
    this.getDepositList();
  
  }
  
}

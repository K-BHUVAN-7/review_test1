import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './tenant.component.html',
  styleUrl: './tenant.component.scss'
})
export class TenantComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private fb: FormBuilder) { } 
  
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

  amountSliderMin = 0;
  amountSliderMax = 0;
  amountMinValue = 0;
  amountMaxValue = 0;

  depositAmtSliderMin = 0;
  depositAmtSliderMax = 0;
  depositAmtMinValue = 0;
  depositAmtMaxValue = 0;

  // utilityAmtSliderMin = 0;
  // utilityAmtSliderMax = 0;
  // utilityAmtMinValue = 0;
  // utilityAmtMaxValue = 0;

  categoryList: any = [
    { value: 'VIP'},
    { value: 'Normal'},
  ];

  frequencyList: any = [
    { value: 'Monthly' },
    { value: 'Quarterly' },
    { value: 'Annually' },
  ]

  categoryOptions = [
    { label: 'All', checked: true, value: null },
    { label: 'VIP', value: true, checked: true },
    { label: 'Normal', value: false, checked: true },
  ];

  // frequencyOptions = [
  //   { label: 'Month', value: 'Month', checked: true, },
  //   { label: 'Year', value: 'Year', checked: true },
  //   { label: 'Lease', value: 'Lease', checked: true },
  // ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Tenant"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});
              
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getTenantList();

    this.initForm();

    this.getAllDetails();
    
  }

  initForm(){
  
    this.filterForm = this.fb.group({

      'propertyName': "",

      'unitName': "",

      'categories': '',
      
      'rentalMin': [this.amountMinValue],

      'rentalMax': [this.amountMaxValue],
      
      'frequency': '',

      'depositAmtMin': [this.depositAmtMinValue],
      
      'depositAmtMax': [this.depositAmtMaxValue],

      // 'utilityAmtMin': [this.utilityAmtMinValue],
      
      // 'utilityAmtMax': [this.utilityAmtMaxValue],

      'ContractStartFromDate': '',
      
      'contractStartToDate': '',

      'contractEndFromDate': '',

      'contractEndToDate': '',

    });

    this.getTenantList();

  }

  // checkboxFilterChange({ event = {}, isAll = false, fieldName }: { event: any; isAll: boolean; fieldName: 'category' | 'frequency'; }) {

  //   let options = fieldName == 'category' ? this.categoryOptions : this.frequencyOptions;

  //   if (isAll) {
    
  //     let checked = event.target.checked;
    
  //     options.forEach(opt => (opt.checked = checked));
    
  //   } else {
    
  //     let allExceptAllChecked = options
    
  //     .filter(opt => opt.label !== 'All')
    
  //     .every(opt => opt.checked);
    
  //     let allItem = options.find(opt => opt.label == 'All');
    
  //     if (allItem) allItem.checked = allExceptAllChecked;
    
  //   }

  //   // Always send selected values (not [])
  //   let selected = options.filter(opt => opt.checked && opt.label !== 'All').map(opt => opt.value);

  //   this.filterForm.get(fieldName)?.setValue(selected);

  // }

  onAmountSliderChange() {

    if (this.amountMinValue > this.amountMaxValue) {
    
      [this.amountMinValue, this.amountMaxValue] = [this.amountMaxValue, this.amountMinValue];
    
    }

    let minPercent = ((this.amountMinValue - this.amountSliderMin) / (this.amountSliderMax - this.amountSliderMin)) * 100;
    
    let maxPercent = ((this.amountMaxValue - this.amountSliderMin) / (this.amountSliderMax - this.amountSliderMin)) * 100;

    // Update only amount sliders CSS
    let sliders = document.querySelectorAll('.amount-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'rentalMin': this.amountMinValue,
    
      'rentalMax': this.amountMaxValue
    
    });

  }

  onDepositAmtSliderChange() {

    if (this.depositAmtMinValue > this.depositAmtMaxValue) {

      [this.depositAmtMinValue, this.depositAmtMaxValue] = [this.depositAmtMaxValue, this.depositAmtMinValue];

    }

    let minPercent = ((this.depositAmtMinValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;
    
    let maxPercent = ((this.depositAmtMaxValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;

    // Update only deposit sliders CSS
    let sliders = document.querySelectorAll('.deposit-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'depositAmtMin': this.depositAmtMinValue,
    
      'depositAmtMax': this.depositAmtMaxValue
    
    });
  
  }

  // onUtilityAmtSliderChange() {

  //   if (this.utilityAmtMinValue > this.utilityAmtMaxValue) {

  //     [this.utilityAmtMinValue, this.utilityAmtMaxValue] = [this.utilityAmtMaxValue, this.utilityAmtMinValue];

  //   }
    
  //   let minPercent = ((this.utilityAmtMinValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;
    
  //   let maxPercent = ((this.utilityAmtMaxValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;

  //   // Update only unit sliders CSS
  //   let sliders = document.querySelectorAll('.unit-slider') as NodeListOf<HTMLInputElement>;
    
  //   sliders.forEach(slider => {
    
  //     slider.style.setProperty('--start', `${minPercent}%`);
    
  //     slider.style.setProperty('--end', `${maxPercent}%`);
    
  //   });

  //   this.filterForm.patchValue({
    
  //     'utilityAmtMin': this.utilityAmtMinValue,
    
  //     'utilityAmtMax': this.utilityAmtMaxValue
    
  //   });
  
  // }

  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
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

  isSelected(controlName: string, id: string): boolean {

    let selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  toggleSelection(controlName: string, value: any): void {

    let control = this.filterForm.get(controlName);
    
    if (!control) return;

    let currentValue = control.value || [];

    if (currentValue.includes(value)) {
    
      control.setValue(currentValue.filter((v: any) => v !== value));
    
    } else {
    
      control.setValue([...currentValue, value]);
    
    }

    control.markAsDirty();
    
    control.markAsTouched();
  
  }
  
  openModal(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/tenant/create-tenant', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/tenant/create-tenant' }); 
        
    }
      
  }
  
  getTenantList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());

    this.service.changePayloadDateFormat({'data': filterValues, 'fields': ['ContractStartFromDate', 'contractStartToDate', 'contractEndFromDate', 'contractEndToDate' ]})

    let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant', ...filterValues };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unit': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'tenantPropertyIds': this.userDetails?.propertyIds };

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url': '/otherUser/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['tenantList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getTenantList();
  
  }

  inactiveTenant(data:any) {

    this.confirmationDialog.confirm({ 'message': `Do you want to ${data.is_active ? 'Inactive' : 'Active'} Tenant`, 'type': 'info', title : data.is_active ? 'Inactive' : 'Active' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.patchService({"url": `/otherUser/inactive/${data?._id}` }).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getTenantList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getTenantList()

          }

        });

      }

    });

  }

  deleteTenant(data?:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error' , title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/otherUser/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getTenantList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getTenantList()

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

    let params =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant'  };

    this.service.getFile({ "url": "/getTenantExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Tenant List.xlsx';

      a.click();

    });

  }

}

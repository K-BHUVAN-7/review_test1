import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss'
})
export class UnitsComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private fb: FormBuilder) { }

  masterList: any = {};
  userDetails: any  = {};
  permissions: any = {};
  companyId: any = {};
  branchId: any = {}
  branchList: any = {}
  _: any = _;

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

  utilityAmtSliderMin = 0;
  utilityAmtSliderMax = 0;
  utilityAmtMinValue = 0;
  utilityAmtMaxValue = 0;

  tenantOptions = [
    { label: 'All', checked: true, value: null },
    { label: 'Rented', value: true, checked: true },
    { label: 'Not Rented', value: false, checked: true },
  ];

  frequencyOptions = [
    { label: 'Monthly', value: 'Monthly', checked: true, },
    { label: 'Yearly', value: 'Yearly', checked: true },
    { label: 'Quarterly', value: 'Quarterly', checked: true },
  ];

  bhkList = [
    { _id: '1', 'countOfBedrooms': 1 },
    { _id: '2', 'countOfBedrooms': 2 },
    { _id: '3', 'countOfBedrooms': 3 },
    { _id: '4', 'countOfBedrooms': 4 },
    { _id: '5', 'countOfBedrooms': 5 },
    { _id: '6', 'countOfBedrooms': 6 },
    { _id: '7', 'countOfBedrooms': 7 },
    { _id: '8', 'countOfBedrooms': 8 },
    { _id: '9', 'countOfBedrooms': 9 },
    { _id: '10', 'countOfBedrooms': 10 },
  
  ]

  furnishingList: any[] = [
    { _id: '1', furnishing: 'Furnished' },
    { _id: '2', furnishing: 'Semi Furnished' },
    { _id: '3', furnishing: 'Unfurnished' }
  ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Units"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
            
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList':  this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getUnitList();

    this.getAllDetails();

    this.initForm();
    
  }

  initForm(){

    this.filterForm = this.fb.group({

      'propertyName': "",

      'countOfBedrooms': "",

      'furnishing': "",
      
      'tenant': '',
      
      'rentalMin': [this.amountMinValue],

      'rentalMax': [this.amountMaxValue],
      
      'frequency': '',

      'depositAmtMin': [this.depositAmtMinValue],
      
      'depositAmtMax': [this.depositAmtMaxValue],

      'utilityAmtMin': [this.utilityAmtMinValue],
      
      'utilityAmtMax': [this.utilityAmtMaxValue],

    });

    this.getUnitList();

  }

  checkboxFilterChange({ event = {}, isAll = false, fieldName }: { event: any; isAll: boolean; fieldName: 'tenant' | 'frequency'; }) {

    let options = fieldName == 'tenant' ? this.tenantOptions : this.frequencyOptions;

    if (isAll) {
    
      const checked = event.target.checked;
    
      options.forEach(opt => (opt.checked = checked));
    
    } else {
    
      const allExceptAllChecked = options
    
      .filter(opt => opt.label !== 'All')
    
      .every(opt => opt.checked);
    
      const allItem = options.find(opt => opt.label == 'All');
    
      if (allItem) allItem.checked = allExceptAllChecked;
    
    }

    // Always send selected values (not [])
    const selected = options.filter(opt => opt.checked && opt.label !== 'All').map(opt => opt.value);

    this.filterForm.get(fieldName)?.setValue(selected);

  }

  calculateUtilityTotal(utilities: any[]): number {

    return _.sumBy(utilities, u => +u.amount);
  
  }

  onAmountSliderChange() {

    if (this.amountMinValue > this.amountMaxValue) {
    
      [this.amountMinValue, this.amountMaxValue] = [this.amountMaxValue, this.amountMinValue];
    
    }

    const minPercent = ((this.amountMinValue - this.amountSliderMin) / (this.amountSliderMax - this.amountSliderMin)) * 100;
    
    const maxPercent = ((this.amountMaxValue - this.amountSliderMin) / (this.amountSliderMax - this.amountSliderMin)) * 100;

    // Update only amount sliders CSS
    const sliders = document.querySelectorAll('.amount-slider') as NodeListOf<HTMLInputElement>;
    
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

    const minPercent = ((this.depositAmtMinValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;
    
    const maxPercent = ((this.depositAmtMaxValue - this.depositAmtSliderMin) / (this.depositAmtSliderMax - this.depositAmtSliderMin)) * 100;

    // Update only deposit sliders CSS
    const sliders = document.querySelectorAll('.deposit-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'depositAmtMin': this.depositAmtMinValue,
    
      'depositAmtMax': this.depositAmtMaxValue
    
    });
  
  }

  onUtilityAmtSliderChange() {

    if (this.utilityAmtMinValue > this.utilityAmtMaxValue) {

      [this.utilityAmtMinValue, this.utilityAmtMaxValue] = [this.utilityAmtMaxValue, this.utilityAmtMinValue];

    }
    
    const minPercent = ((this.utilityAmtMinValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;
    
    const maxPercent = ((this.utilityAmtMaxValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;

    // Update only unit sliders CSS
    const sliders = document.querySelectorAll('.unit-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'utilityAmtMin': this.utilityAmtMinValue,
    
      'utilityAmtMax': this.utilityAmtMaxValue
    
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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),
      
      'owner': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'owner', is_active: true },
        
        'loaderState': true

      }),

      'manager': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager', is_active: true },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.owner?.status == 'ok') this.masterList['ownerList'] = res.owner.data;

        if(res.manager?.status == 'ok') this.masterList['managerList'] = res.manager.data;

      }
  
    });

  }

  isSelected(controlName: string, id: string): boolean {

    const selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getUnitList();
  
  }

  getUnitList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }
    
    let filterValues = _.pickBy(this.filterForm.getRawValue());

    const furnishingIds = filterValues['furnishing'] || [];

    const selectedFurnishings = _.map( _.filter(this.furnishingList, item => _.includes(furnishingIds, item._id)), 'furnishing' );

    if (_.includes(filterValues['tenant'], true)) {

      filterValues['is_occupied'] = true;

    } else {

      _.isEmpty(filterValues['tenant']) ? '' : filterValues['is_occupied'] = false;

    }

    filterValues = _.omit(filterValues , 'tenant');

    if (_.size(selectedFurnishings) > 0) {

      filterValues['furnishing'] = selectedFurnishings;
    
    } else {
    
      filterValues = _.omit(filterValues, 'furnishing');

    }

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...filterValues };

    const params = { 'pageIndex': this.pageIndex, 'pageSize': this.pageSize, 'searchValue': this.searchValue };

    this.service.postService({'url': '/unit/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        if (this.userDetails?.userType == 'owner' || this.userDetails?.userType == 'manager') {

          this.masterList['unitList'] = _.filter(res.data, (unit: any) =>

            _.includes(this.userDetails?.propertyIds, unit?.propertyName?._id)

          );

        } else {

          this.masterList['unitList'] = res.data;

        }

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  createUnits(data?:any){

    const queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/units/create-units' , queryParams });

    } else {

      this.service.navigate({ 'url': 'app/units/create-units' }); 
        
    }
      
  }
  
  inactiveUnit(data:any) {

    this.confirmationDialog.confirm({ 'message': `Do you want to ${data.is_active ? 'Inactive' : 'Active'} Unit`, 'type': 'info', title : data.is_active ? 'Inactive' : 'Active' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.patchService({"url": `/unit/inactive/${data?._id}` }).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getUnitList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getUnitList()

          }

        });

      }

    });

  }

  deleteUnit(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/unit/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getUnitList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getUnitList()

          }

        });

      }

    });

  }

  xlDownload(){
  
    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId
    }

    let params =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId };

    this.service.getFile({ "url": "/getUnitExcel", params }).subscribe((res: any) => {

      const url = window.URL.createObjectURL(res);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'Unit List.xlsx';

      a.click();

    });

  }

}

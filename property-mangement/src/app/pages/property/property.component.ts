import { Component, Input, input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _, { set } from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss'
})
export class PropertyComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private fb: FormBuilder) { }

  _: any = _;
  permissions: any = {}
  masterList: any = {};
  userDetails: any  = {};
  
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  
  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;
  filterForm: FormGroup = new FormGroup({});

  unitSliderMin = 0;
  unitSliderMax = 50;
  unitMinValue = 0;
  unitMaxValue = 50;

  unitOccupiedMinValue: number = 0;
  unitOccupiedMaxValue: number = 50;
  occupiedUnitSliderMin = 0;
  occupiedUnitSliderMax = 50;

  statusOptions = [
    { label: 'All', checked: true, value: null },
    { label: 'Active', value: true, checked: true },
    { label: 'Inactive', value: false, checked: true },
  ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Property"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
              
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getPropertyList();

    this.getAllDetails();

    this.initForm();

  }

  initForm(){

    this.filterForm = this.fb.group({

      'propertyType': "",

      'unitMin': [this.unitMinValue],

      'unitMax': [this.unitMaxValue],

      'occupiedUnitsMin': [this.unitOccupiedMinValue],

      'occupiedUnitsMax': [this.unitOccupiedMaxValue],
    
      'owner': '',

      'manager': '',

      'status': ''

    });

    this.getPropertyList();

  }

  checkboxFilterChange({ event = {}, isAll = false, fieldName = 'status' } :{ event: any, isAll: boolean, fieldName: any }) {

    let array: any = [];

    if(fieldName == 'status') array = this.statusOptions;

    if(isAll) this.service.changeSelectAll(event,array);

    else array[0]['checked'] = _.every(_.filter(array,(e)=>e.label != 'All'), 'checked');
    
    let arr = _.map(_.filter(array,'checked'),"value");

    this.filterForm.get(fieldName)?.setValue(arr.includes(null) ? [] : arr);

  }

  onTotalUnitSliderChange() {

    if (this.unitMinValue > this.unitMaxValue) {
    
      let temp = this.unitMinValue;
    
      this.unitMinValue = this.unitMaxValue;
    
      this.unitMaxValue = temp;
    
    }

    let minPercent = ((this.unitMinValue - this.unitSliderMin) / (this.unitSliderMax - this.unitSliderMin)) * 100;
    
    let maxPercent = ((this.unitMaxValue - this.unitSliderMin) / (this.unitSliderMax - this.unitSliderMin)) * 100;

    let sliders = document.querySelectorAll('.unit-slider input[type=range]');
    
    sliders.forEach((slider: any) => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'unitMin': this.unitMinValue,
    
      'unitMax': this.unitMaxValue
    
    });

  }

  onOccupiedUnitSliderChange() {

    if (this.unitOccupiedMinValue > this.unitOccupiedMaxValue) {
   
      let temp = this.unitOccupiedMinValue;
    
      this.unitOccupiedMinValue = this.unitOccupiedMaxValue;
   
      this.unitOccupiedMaxValue = temp;
   
    }

    let minPercent = ((this.unitOccupiedMinValue - this.occupiedUnitSliderMin) / (this.occupiedUnitSliderMax - this.occupiedUnitSliderMin)) * 1;
   
    let maxPercent = ((this.unitOccupiedMaxValue - this.occupiedUnitSliderMin) / (this.occupiedUnitSliderMax - this.occupiedUnitSliderMin)) * 1;

    let sliders = document.querySelectorAll('.occupiedUnit-slider') as NodeListOf<HTMLInputElement>;
   
    sliders.forEach((slider: any) => {
   
      slider.style.setProperty('--start', `${minPercent}%`);
   
      slider.style.setProperty('--end', `${maxPercent}%`);
   
    });

    this.filterForm.patchValue({
   
      'occupiedUnitsMin': this.unitOccupiedMinValue,
   
      'occupiedUnitsMax': this.unitOccupiedMaxValue
   
    });
  
  }

  // getOccupiedUnitThumbPosition(value: number): number {

  //   return ((value - this.unitSliderMin) / (this.unitSliderMax - this.unitSliderMin)) * 1;
  
  // }

  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'propertyTypeList': this.service.postService({ 
        
        "url": "/master/propertyType/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
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
        
        if(res.propertyTypeList?.status == 'ok') this.masterList['propertyTypeList'] = res.propertyTypeList.data || [];

        if(res.owner?.status == 'ok') this.masterList['ownerList'] = res.owner.data;

        if(res.manager?.status == 'ok') this.masterList['managerList'] = res.manager.data;

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
  
    this.getPropertyList();
  
  }

  getPropertyList(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());

    if (_.includes(filterValues['status'], true)) {

      filterValues['is_active'] = true;

    }  else {

      _.isEmpty(filterValues['status']) ? '' : filterValues['is_active'] = false;

    }

    filterValues = _.omit(filterValues , 'status');

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...filterValues  };

    if(this.userDetails.userType == 'manager') {

      payload['manager'] = this.userDetails.id;

    } else if (this.userDetails.userType == 'owner') {

      payload['owner'] = this.userDetails.id;

    }

    let params = { 'pageIndex': this.pageIndex, 'pageSize': this.pageSize, 'searchValue': this.searchValue };

    this.service.postService({'url': '/property/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['propertyList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  getTooltipList(list: any[], label: string, primaryProperty: string, secondaryProperty?: string): string {

    if (!list || list.length === 0) return `No ${label} found`;

    let formattedList = list.map((item, index) => {

      let primaryValue = item[primaryProperty] || '';

      let secondaryValue = secondaryProperty ? ` ${item[secondaryProperty] || ''}` : '';

      return `${index + 1}. ${primaryValue} ${secondaryValue}`;

    }).join('\n');

    return `${label}s:\n${formattedList}`;

  }

  // getTooltipList(list: any[], label: string): string {

  //   if (!list || list.length == 0) return `No ${label} found`;
  
  //   let formattedList = list.map((item, index) => `${index + 1}. ${item.firstName} ${item.lastName || ''}`).join('\n');
  
  //   return `${label}s:\n${formattedList}`;

  // }

  // getTypeTooltipList(list: any[], label: string): string {

  //   if (!list || list.length == 0) return `No ${label} found`;
  
  //   let formattedList = list.map((item, index) => `${index + 1}. ${item.propertyName}`).join('\n');
  
  //   return `${label}s:\n${formattedList}`;

  // }

  createProperty(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/property/create-property' , queryParams });

    } else {

      this.service.navigate({ 'url': 'app/property/create-property' }); 
        
    }
      
  }

  inactiveProperty(data:any) {

    this.confirmationDialog.confirm({ 'message': `Do you want to ${data.is_active ? 'Inactive' : 'Active'} Property ? `, 'type': 'info', title : data.is_active ? 'Inactive' : 'Active' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.patchService({"url": `/property/inactive/${data?._id}` }).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getPropertyList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getPropertyList()

          }

        });

      }

    });

  }

  deleteProperty(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/property/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getPropertyList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getPropertyList()

          }

        });

      }

    });

  }

  xlDownload(){

    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;
    }

    let params =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId };

    this.service.getFile({ "url": "/getPropertyExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Property List.xlsx';

      a.click();

    });

  }

}

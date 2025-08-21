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
  selector: 'app-manager',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.scss'
})
export class ManagerComponent {

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

    this.permissions = this.service.getPermissions({ pathArr: ["Manager"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
            
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getManagerList();

    this.initForm();

    this.getAllDetails();
    
  }

  initForm(){

    this.filterForm = this.fb.group({

      'propertyIds': "",

      // 'unitMin': [this.unitMinValue],
    
      // 'unitMax': [this.unitMaxValue],

      'status': [] 

    });

    this.getManagerList();

  }

  checkboxFilterChange({ event = {}, isAll = false, fieldName = 'status' } :{ event: any, isAll: boolean, fieldName: any }) {
  
    let array: any = [];

    if(fieldName == 'status') array = this.statusOptions;

    if(isAll) this.service.changeSelectAll(event,array);

    else array[0]['checked'] = _.every(_.filter(array,(e)=>e.label != 'All'),'checked');
    
    let arr = _.map(_.filter(array,'checked'),"value");

    this.filterForm.get(fieldName)?.setValue(arr.includes(null) ? [] : arr);

  }

  // onTotalUnitSliderChange() {

  //   if (this.unitMinValue > this.unitMaxValue) {
    
  //     let temp = this.unitMinValue;
    
  //     this.unitMinValue = this.unitMaxValue;
    
  //     this.unitMaxValue = temp;
    
  //   }

  //   let minPercent = ((this.unitMinValue - this.unitSliderMin) / (this.unitSliderMax - this.unitSliderMin)) * 100;
    
  //   let maxPercent = ((this.unitMaxValue - this.unitSliderMin) / (this.unitSliderMax - this.unitSliderMin)) * 100;

  //   let sliders = document.querySelectorAll('.range-slider input[type=range]');
    
  //   sliders.forEach((slider: any) => {
    
  //     slider.style.setProperty('--start', `${minPercent}%`);
    
  //     slider.style.setProperty('--end', `${maxPercent}%`);
    
  //   });

  //   this.filterForm.patchValue({
    
  //     unitMin: this.unitMinValue,
    
  //     unitMax: this.unitMaxValue
    
  //   });

  // }

  isSelected(controlName: string, id: string): boolean {

    let selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
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

      })

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

      }
  
    });

  }

  getTooltipList(list: any[], label: string): string {

    if (!list || list.length == 0) return `No ${label} found`;
  
    let formattedList = list.map((item, index) => `${index + 1}. ${item.propertyName || ''}`).join('\n');
  
    return `${label}s:\n${formattedList}`;

  }

  openModal(data?:any){

    let queryParams = { 

      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/manager/create-manager', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/manager/create-manager' }); 
        
    }
      
  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getManagerList();
  
  }
    
  getManagerList(){

    if(_.size(this.masterList['companyList'])>1) {
        
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());
    
      if (_.includes(filterValues['status'], true)) {
  
        filterValues['is_active'] = true;
  
      }  else {
  
        _.isEmpty(filterValues['status']) ? '' : filterValues['is_active'] = false;
  
      }

    filterValues = _.omit(filterValues , 'status');

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager', ...filterValues };

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url': '/otherUser/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['managerList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  inactiveManager(data:any) {

    this.confirmationDialog.confirm({ 'message': `Do you want to ${data.is_active ? 'Inactive' : 'Active'} Manager ?`, 'type': 'info', title : data.is_active ? 'Inactive' : 'Active' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.patchService({"url": `/otherUser/inactive/${data?._id}` }).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getManagerList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getManagerList()

          }

        });

      }

    });

  }

  deleteManager(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title : 'Delete' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/otherUser/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data': { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getManagerList()

          } else {

            this.service.showToastr({ 'data': { 'message': `${res.message}`, 'type': 'info' } });

            this.getManagerList();

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

    let params =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager'  };

    this.service.getFile({ "url": "/getManagerExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Manager List.xlsx';

      a.click();

    });

  }

}
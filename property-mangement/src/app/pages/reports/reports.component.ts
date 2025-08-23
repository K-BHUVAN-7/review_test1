import { Component, Input, input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _, { set } from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

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

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Reports"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
              
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    // this.openReports();

    this.getAllDetails();

  }

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

  openReports(reportType?: string) {

    this.service.navigate({ url: 'app/reports/report-export', queryParams: { 'reportType': reportType } });

    // if (_.size(this.masterList['companyList']) > 1) {

    //   this.companyId = _.map(this.masterList['companyList'], 'companyId');

    // } else {

    //   this.companyId = this.companyId;

    // }

    // let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'reportType': reportType };

    // let params = { 'pageIndex': this.pageIndex, 'pageSize': this.pageSize, 'searchValue': this.searchValue };

    // this.service.postService({ url: '/reports/list', payload, params }).subscribe((res: any) => {

    //   if (res.status == 'ok') {

    //     this.service.navigate({ url: 'app/reports/report-export', queryParams: { reportType: reportType } });

    //   }

    // });

  }

  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    // this.openReports();
  
  }
  
}

import { Component } from '@angular/core';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { TenantDashboardComponent } from "./tenant-dashboard/tenant-dashboard.component";
import { ManagerDashboardComponent } from "./manager-dashboard/manager-dashboard.component";
import { StaffDashboardComponent } from "./staff-dashboard/staff-dashboard.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, OwnerDashboardComponent, TenantDashboardComponent, ManagerDashboardComponent, StaffDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService,) { } 
    
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
  pageSizeArr: any = [];
  searchValue: any = "";

  selectedDashboard: string = '';

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Dashboard"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
            
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    let type = this.userDetails?.userType?.toLowerCase();

    switch (type) {

      case 'admin':
      
        this.selectedDashboard = 'owner';
      
      break;

      case 'owner':
      
        this.selectedDashboard = 'owner';
      
      break;
     
      case 'manager':
      
        this.selectedDashboard = 'manager';
      
      break;
      
      case 'staff':
      
        this.selectedDashboard = 'staff';
      
      break;

      case 'tenant':
      
        this.selectedDashboard = 'tenant';
      
      break;
    
    }

  }

}

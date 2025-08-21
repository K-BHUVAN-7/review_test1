import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { TenantTicketsComponent } from "./tenant-tickets/tenant-tickets.component";
import { ManagerTicketsComponent } from "./manager-tickets/manager-tickets.component";
import { StaffTicketsComponent } from "./staff-tickets/staff-tickets.component";
import { OwnerTicketsComponent } from "./owner-tickets/owner-tickets.component";

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [SharedModule, TenantTicketsComponent, ManagerTicketsComponent, StaffTicketsComponent, OwnerTicketsComponent],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent {

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

  selectedTicket: string = '';

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

    let type = this.userDetails?.userType?.toLowerCase();

    switch (type) {

      case 'admin':
      
        this.selectedTicket = 'tenant';
      
      break;
      
      case 'tenant':
      
        this.selectedTicket = 'tenant';
      
      break;
      
      case 'manager':
      
        this.selectedTicket = 'manager';
      
      break;
      
      case 'staff':
      
        this.selectedTicket = 'staff';
      
      break;
      
      case 'owner':
      
        this.selectedTicket = 'owner';
      
      break;
    
    }

  }

  // openTenantTicketModal(data?:any){

  //   let queryParams = { 
      
  //     'id': data?._id,
    
  //   };

  //   if(!_.isEmpty(queryParams)) {

  //     this.service.navigate({ 'url': 'app/tickets/tenant-tickets', queryParams });

  //   } else {

  //     this.service.navigate({ 'url': 'app/tickets/tenant-tickets' }); 
        
  //   }
      
  // }

  // openManagerTicketModal(data?:any){

  //   let queryParams = { 
      
  //     'id': data?._id,
    
  //   };

  //   if(!_.isEmpty(queryParams)) {

  //     this.service.navigate({ 'url': 'app/tickets/manager-tickets', queryParams });

  //   } else {

  //     this.service.navigate({ 'url': 'app/tickets/manager-tickets' }); 
        
  //   }
      
  // }

  // openStaffTicketModal(data?:any){

  //   let queryParams = { 
      
  //     'id': data?._id,
    
  //   };

  //   if(!_.isEmpty(queryParams)) {

  //     this.service.navigate({ 'url': 'app/tickets/staff-tickets', queryParams });

  //   } else {

  //     this.service.navigate({ 'url': 'app/tickets/staff-tickets' }); 
        
  //   }
      
  // }

  // openOwnerTicketModal(data?:any){

  //   let queryParams = { 
      
  //     'id': data?._id,
    
  //   };

  //   if(!_.isEmpty(queryParams)) {

  //     this.service.navigate({ 'url': 'app/tickets/owner-tickets', queryParams });

  //   } else {

  //     this.service.navigate({ 'url': 'app/tickets/owner-tickets' }); 
        
  //   }
      
  // }

}

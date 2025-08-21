import { Component } from '@angular/core';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { CreateRoleComponent } from "./create-role/create-role.component";
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {

  constructor(public service: CommonService,private confirmationDialog: ConfirmationDialogService) { }

  masterList : any = {};
  mode : any = 'Create'
  editData : any  = {}
  userDetails : any  = [];
  isMode : Boolean = false
  _: any = _;

  pageIndex: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  searchValue: any = "";

  ngOnInit(): void {

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};
    
    this.getRoles();
    
  }

  openModal(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/masters/roles/create-roles' , queryParams });

    } else {

      this.service.navigate({ 'url': 'app/masters/roles/create-roles' }); 
        
    }
      
  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getRoles();
  
  }

  getRoles(){

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url' : '/master/roles/list', payload : { 'parentCompanyId': this.userDetails.parentCompanyId }, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['rolesList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  deleteRoles(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error' , title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/master/roles/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
              this.getRoles();

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });
            
          }

        });

      }

    });
   
  }

  xlDownload(){
    
    let params =  {'parentCompanyId': this.userDetails.parentCompanyId };

    this.service.getFile({ "url": "/master/getRolesExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Roles List.xlsx';

      a.click();

    });

  }

}

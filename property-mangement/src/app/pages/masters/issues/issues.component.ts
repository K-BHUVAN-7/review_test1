import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.scss',
  providers:[NgbActiveModal]
})
export class IssuesComponent {

  @ViewChild("issueModal") issueModal!: ModalComponent;

  mode: string = "Create";
  formSubmitted: boolean = false;
  _: any = _;
  editData: any = {};
  issueForm: FormGroup = new FormGroup({});
  userDetails: any = [];
  masterList: any = {};

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  searchValue: any = "";

  permissions: any = {};

  constructor(public service: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) { 

    this.permissions = this.service.getPermissions({ pathArr: ["Masters", 'Issue Category'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                  
    this.masterList = {

      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getIssueList();

    this.getAllDetails();

    this.loadForm();

  }

  ngOnInit(): void { }
  
  getAllDetails() {

    if(_.size(this.masterList['companyList'])>1) {
          
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId }
  
    forkJoin({

      // 'owner': this.service.postService({ 

      //   "url": "/owner/list", 
        
      //   payload, 
        
      //   'loaderState': true 
      
      // }),

      'manager': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager' }, 
        
        'loaderState': true 

      }),
      'staff': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff' }, 
        
        'loaderState': true 

      }),
      
    }).subscribe({
    
      next: (res: any) => {

        // if(res.owner?.status == 'ok') this.masterList['ownerList'] = res.owner.data;

        if(res.manager?.status == 'ok') this.masterList['managerList'] = res.manager.data;

        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;

      }
      
    });

  }

  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getIssueList();
  
  }

  getIssueList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId };

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ "url": "/master/issue/list", payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['issueList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.issueForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'issueName': [ this.editData.issueName || "", Validators.required ],

      'priority': [ this.editData.priority || null ] ,

      "tat": [ this.editData.tat || '' ],

      "tatType": [ this.editData.tatType || 'days' ],

      // "staff": [ this.editData.staff?._id || '' ],

      // "manager": [ this.editData.manager?._id || '' ],

    })

  }

  get f():any { return this.issueForm.controls; }
  
  openModal(data?:any){

    this.mode =  _.isEmpty(data) ? "Create" : "Update";
    
    this.editData = this.mode == "Create" ? {} : data;
    
    this.loadForm();
    
    this.issueModal.open();
    
  }
  
  submit() {

    this.formSubmitted = true;

    if(this.issueForm.invalid) return;
  
    let payload = this.issueForm.value;

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent : false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result' : _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/master/issue/create', payload }) : 
        
          this.service.patchService({ 'url': `/master/issue/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success"  }});

              this.issueModal.close();

              this.searchValue = '';

              this.getIssueList()

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })
    
  }

  deletePropertyType(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error' , title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/master/issue/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getIssueList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getIssueList();
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

    this.service.getFile({ "url": "/master/getIssueExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Issue Category List.xlsx';

      a.click();

    });

  }

}

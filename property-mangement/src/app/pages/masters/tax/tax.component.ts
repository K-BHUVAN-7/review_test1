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
  selector: 'app-tax',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './tax.component.html',
  styleUrl: './tax.component.scss',
  providers: [NgbActiveModal]
})
export class TaxComponent {

  @ViewChild("taxModal") taxModal!: ModalComponent;
  
  mode: string = "Create";
  formSubmitted: boolean = false;
  _: any = _;
  editData: any = {};
  taxForm: FormGroup = new FormGroup({});
  permissions: any = {};
  userDetails: any = [];
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  masterList: any = {};

  constructor(public service: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) { }

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Masters", "Tax"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId});

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getCurrencyList();

    this.loadForm();

  }

  // close(){

  //   this.formSubmitted = false;

  //   this.taxModal.close();

  // }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;

    this.getCurrencyList();
  
  }

  getCurrencyList(){

    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;
    }

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ "url": "/master/tax/list", payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['currencyList'] = res.data;
        
        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  loadForm () {
  
    this.taxForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'taxCode': [ this.editData?.taxCode || '', Validators.required ],

      'taxPercentage': [ this.editData?.taxPercentage || '', Validators.required ],

    });

  }

  get f():any { return this.taxForm.controls; }

  openModal(data?:any){

    this.mode = _.isEmpty(data) ? "Create" : "Update";
    
    this.editData = this.mode == "Create" ? {} : data;

    this.loadForm();

    this.taxModal.open();
    
  }
  
  submit() {

    this.formSubmitted = true;

    if(this.taxForm.invalid) return;
  
    let payload = this.taxForm.value;

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result': _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/master/tax/create', payload }) : 
        
          this.service.patchService({ 'url': `/master/tax/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });
              
              this.loadForm();

              this.taxModal.close();

              this.searchValue = '';

              this.getCurrencyList();

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': `${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })
    
  }

  deleteCurrency(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title: 'Delete' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/master/tax/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data': { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getCurrencyList();

          } else {

            this.service.showToastr({ 'data': { 'message': `${res.message}`, 'type': 'info' } });

            this.getCurrencyList();
            
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

    this.service.getFile({ "url": "/master/getTaxExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Tax List.xlsx';

      a.click();

    });

  }

  

}
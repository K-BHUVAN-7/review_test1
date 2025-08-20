import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-id-proof',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './id-proof.component.html',
  styleUrl: './id-proof.component.scss',
  providers:[NgbActiveModal]
})
export class IdProofComponent {
 
  @ViewChild("idProofModal") idProofModal!: ModalComponent;
  
  constructor(public service: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) { }
  
  mode: string = "Create";
  formSubmitted: boolean = false;
  _: any = _;
  editData: any = {};
  idProofForm: FormGroup = new FormGroup({});
  userDetails: any  = [];
  masterList: any = {};
  permissions: any = {};
  
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  filterForm: FormGroup = new FormGroup({});

  isExpiryYes: boolean = true;
  isExpiryNo: boolean = false;

  isRequiredYes: boolean = true;
  isRequiredNo: boolean = false;

  ngOnInit(): void {
    
    this.permissions = this.service.getPermissions({ pathArr: ["Master", 'Id Proof'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getIDProofList();
    
    this.loadForm();

    // this.initForm();

  }

  // initForm(){

  //   this.filterForm = this.fb.group({

  //     'proofName': "",

  //     'isExpiry': [''],

  //     'isRequired': ['']

  //   });

  //   this.getIDProofList();

  //   this.filterForm.valueChanges.subscribe((formValues) => {

  //     this.pageIndex = 1;
     
  //     this.getIDProofList();

  //   });

  // }

  // isSelected(id: string): boolean {

  //   let proofs = this.filterForm.get('proofName')?.value || [];
    
  //   return proofs.includes(id);
  
  // }

  // onExpirySelect(option: 'yes' | 'no') {

  //   let current = this.filterForm.get('isExpiry')?.value;
    
  //   if (current == option) {
    
  //     this.filterForm.get('isExpiry')?.setValue('');
    
  //   } else {
    
  //     this.filterForm.get('isExpiry')?.setValue(option);
    
  //   }

  // }

  // onRequiredSeelct(option: 'yes' | 'no') {

  //   let current = this.filterForm.get('isRequired')?.value;
    
  //   if (current == option) {
    
  //     this.filterForm.get('isRequired')?.setValue('');
    
  //   } else {
    
  //     this.filterForm.get('isRequired')?.setValue(option);
    
  //   }

  // }

  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getIDProofList();
  
  }

  getIDProofList(): void {
  
    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    }
  
    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };

    let params = { 'pageIndex': this.pageIndex, 'pageSize': this.pageSize, 'searchValue': this.searchValue };

    this.service.postService({ url: '/master/idProof/list', payload, params }).subscribe((res: any) => {

      if (res.status == 'ok') {
      
        this.masterList['idProofList'] = res.data.items || res.data;
      
        this.totalCount = res.data.totalCount || res.totalCount || 0;
      
      }
    
    });
  
  }

  loadForm() {

    this.formSubmitted = false;

    this.idProofForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'proofName': [ this.editData.proofName || "", Validators.required] ,

      'isExpiry': [ this.editData.isExpiry || false ],

      'isRequired': [ this.editData.isRequired || false ]

    })

  }

  get f(): any { return this.idProofForm.controls; }
  
  openModal(data?: any){

    this.mode =  _.isEmpty(data) ? "Create" : "Update";
    
    this.editData = this.mode == "Create" ? {} : data;

    this.loadForm();

    this.idProofModal.open();
      
  }
  
  submit() {

    this.formSubmitted = true;

    if(this.idProofForm.invalid) return;
  
    let payload = this.idProofForm.value;

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result' : _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/master/idProof/create', payload }) : 
        
          this.service.patchService({ 'url': `/master/idProof/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });

              this.idProofModal.close();

              this.searchValue = '';

              this.getIDProofList()

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })
    
  }

  deleteIdProof(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title: 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/master/idProof/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': 'Deleted Successfully', 'type': 'success' } });
            
            this.getIDProofList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            // this.getDocumentList({});
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

    this.service.getFile({ "url": "/master/getIdProofExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'ID Proof List.xlsx';

      a.click();

    });

  }

}
  
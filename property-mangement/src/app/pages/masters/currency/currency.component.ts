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
  selector: 'app-currency',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.scss',
  providers: [NgbActiveModal]
})
export class CurrencyComponent {

 @ViewChild("currencyModal") currencyModal!: ModalComponent;

  mode: string = "Create";
  formSubmitted: boolean = false;
  _: any = _;
  editData: any = {};
  currencyForm: FormGroup = new FormGroup({});
  permissions: any = {};
  userDetails: any = [];
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  originalEditData: any;

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;
  currencyNameList: any =[]

  masterList: any = {};

  constructor(public service: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) { }

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Masters", "Currency"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId});

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getCurrencyList();

    this.getCountryList();
    
    // this.loadForm();

  }

  // close(){

  //   this.formSubmitted = false;

  //   this.currencyModal.close();

  // }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;

    this.getCurrencyList();
  
  }

  getCountryList() {

    this.service.getService({ "url": "/countries", 'loaderState': true}).subscribe((res: any) => {

      if(res.status=='ok') {
        
        this.masterList['countryList'] = res.data;

      }

    });

  }

  getCurrencyList(){

    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId
    }

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ "url": "/master/currency/list", payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['currencyList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  openModal(data?: any) {
    
    this.mode = _.isEmpty(data) ? 'Create' : 'Update';

    this.mode == 'Update' ? this.editData = _.cloneDeep(data)  : {}

    this.loadForm();
    
    this.currencyModal.open();

  }

  loadForm() {

    this.formSubmitted = false

    this.currencyForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'countryName': [ this.editData?.countryName?._id || null, Validators.required ],

      'currencyCode': [ this.editData?.currencyCode || null, Validators.required ],

      'currencyName': [ this.editData?.currencyName || null, Validators.required ],

      'defaultExchangeRate': [ this.editData?.defaultExchangeRate || '' ],

      'currentExchangeRate': [ this.editData?.currentExchangeRate || '' ],

      'currencyCents': [ this.editData?.currencyCents || '', Validators.required ],

      'decimalPoints': [ this.editData?.decimalPoints || '', Validators.required ],

      'commaType': [ this.editData?.commaType || null, Validators.required ],

      'isDefault': [ this.editData?.isDefault || false ]

    });

    // this.masterList['currencyCodeList'] = _.uniqBy(_.map( this.masterList['countryList'], (e) => { return { 'currencyCode': e.currencyCode } }), 'currencyCode');

    // this.masterList['currencyNameList'] = _.uniqBy(_.map( this.masterList['countryList'], (e) => { return { 'currencyName': e.currencyName } }), 'currencyName');

    // this.masterList['currencyCent'] =  _.uniqBy(_.map( this.masterList['countryList'], (e) => { return { 'cent': e.cent } }), 'cent').filter((e)=>e.cent!='');

    this.currencyForm.get('countryName')?.valueChanges.subscribe((value: any) => {

      this.currencyForm.patchValue({ 
       
        'currencyCode': _.find( this.masterList['countryList'], { '_id': value })?.currencyCode || '',

        'currencyName': _.find( this.masterList['countryList'], { '_id': value })?.currencyName || '',

        'currencyCents': _.find( this.masterList['countryList'], { '_id': value })?.cent || '',

        'decimalPoints': _.find( this.masterList['countryList'], { '_id': value })?.decimalPoints || '',

      });

    });

    this.currencyForm.get('currencyName')?.valueChanges.subscribe((value: any) => {

      this.currencyForm.patchValue({ 
       
        'currencyCode': _.find( this.masterList['countryList'], { 'currencyName': value })?.currencyCode || '',

        'currencyCents': _.find( this.masterList['countryList'], { 'currencyName': value })?.cent || '',

        'decimalPoints': _.find( this.masterList['countryList'], { 'currencyName': value })?.decimalPoints || '',

      });

    });
    
    // this.changeValue({});

  }

  get f():any { return this.currencyForm.controls; }

  // changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }) { 

  //   if(fieldName == 'countryName') {

  //     let value = this.f.countryName.value
      
  //     this.currencyForm.patchValue({ 
       
  //       'currencyCode': _.find(this.masterList['countryList'], { '_id': value })?.currencyCode || '',

  //       'currencyName': _.find(this.masterList['countryList'], { '_id': value })?.currencyName || '',

  //       'currencyCents': _.find(this.masterList['countryList'], { '_id': value })?.cent || '',

  //       'decimalPoints': _.find(this.masterList['countryList'], { '_id': value })?.decimalPoints || '',

  //       'commaType': '',

  //     });

  //   }

  //   if(fieldName == 'currencyName') {

  //     let value = this.f.currencyName.value;

  //     this.currencyForm.patchValue({ 
       
  //       'currencyCode': _.find( this.masterList['countryList'], { 'currencyName': value })?.currencyCode || '',

  //       'currencyCents': _.find( this.masterList['countryList'], { 'currencyName': value })?.cent || '',

  //       'decimalPoints': _.find( this.masterList['countryList'], { 'currencyName': value })?.decimalPoints || '',

  //     });

  //   }

  // }
  
  submit() {

    this.formSubmitted = true;

    if(this.currencyForm.invalid) return;
  
    let payload = this.currencyForm.value;
    
    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your change before exiting?",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result': _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/master/currency/create', payload }) : 
        
          this.service.patchService({ 'url': `/master/currency/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });
              
              // this.loadForm();

              this.currencyModal.close();
              
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

  closeForm() {

    this.currencyModal.close()

  }

  deleteCurrency(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error', title: 'Delete' }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/master/currency/"+ data?._id).subscribe((res: any) => {

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

    this.service.getFile({ "url": "/master/getCurrencyExcel", params }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = 'Currency List.xlsx';

      a.click();

    });

  }

}

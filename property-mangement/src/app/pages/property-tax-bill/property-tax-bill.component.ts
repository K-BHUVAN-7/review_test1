import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-property-tax-bill',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './property-tax-bill.component.html',
  styleUrl: './property-tax-bill.component.scss'
})
export class PropertyTaxBillComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute,private sanitizer: DomSanitizer, private modalService: NgbModal, private fb: FormBuilder) {}
  
  masterList: any = {};
  formSubmitted: boolean = false;
  mode: any = 'Create';
  permissions: any = {};
  userDetails: any = {};
  _: any = _;
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  queryParamsValue: any = {};
  filterForm: FormGroup = new FormGroup({});

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  utilityAmtSliderMin = 0;
  utilityAmtSliderMax = 100000;
  utilityAmtMinValue = 0;
  utilityAmtMaxValue = 100000;

  filteredUnitList: any[] = [];
  editData:any = {};

  utilityBillList: Array<any> = [];
  // newBill: any = this.getEmptyBill();
  editingRowIndex: number | null = null;
  utilityBillForm: FormGroup = new FormGroup({});

  statusOptions = [
    { label: 'Not Yet Due', value: 'notYetDue', checked: true },
    { label: 'Overdue', value: 'overdue', checked: true },
    { label: 'Paid', value: 'paid', checked: true },
  ];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
    
      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({ 'url' : '/property-tax-bill/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId, "_id" : this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

          } 

        })

      } else {

      this.mode == 'Create';

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Property Tax Bill"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});
        
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};
    
    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');
    
    this.getPropertyTaxBillList();

    this.getAllDetails();

    this.initForm();

  }

  initForm(){
  
    this.filterForm = this.fb.group({

      'property': "",

      'unit': "",

      'utility': "",

      'utilityMin': [this.utilityAmtMinValue],

      'utilityMax': [this.utilityAmtMaxValue],

      'billStartDate': '',
      
      'billEndDate': '',

      'dueStartDate': '',
      
      'dueEndDate': '',

    });

    this.getPropertyTaxBillList();

  }

  onAmountSliderChange() {

    if (this.utilityAmtMinValue > this.utilityAmtMaxValue) {
    
      [this.utilityAmtMinValue, this.utilityAmtMaxValue] = [this.utilityAmtMaxValue, this.utilityAmtMinValue];
    
    }

    const minPercent = ((this.utilityAmtMinValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;
    
    const maxPercent = ((this.utilityAmtMaxValue - this.utilityAmtSliderMin) / (this.utilityAmtSliderMax - this.utilityAmtSliderMin)) * 100;

    // Update only amount sliders CSS
    const sliders = document.querySelectorAll('.amount-slider') as NodeListOf<HTMLInputElement>;
    
    sliders.forEach(slider => {
    
      slider.style.setProperty('--start', `${minPercent}%`);
    
      slider.style.setProperty('--end', `${maxPercent}%`);
    
    });

    this.filterForm.patchValue({
    
      'utilityMin': this.utilityAmtMinValue,
    
      'utilityMax': this.utilityAmtMaxValue
    
    });

  }

  getAllDetails(){
  
    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'utilities': this.service.postService({ 
        
        "url": "/master/utility/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),
    
    }).subscribe({
  
      next: (res: any) => {
  
        // if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];
        
        // if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.utilities?.status == 'ok') this.masterList['utilityList'] = res.utilities.data || [];

        if (res.propertyList?.status == 'ok') {
    
          if (this.userDetails.userType == 'manager' || this.userDetails.userType == 'owner') {

            const allowedPropertyIds = _.map(this.userDetails.propertyIds);

            this.masterList['propertyList'] = _.filter(res.propertyList.data, (propertyList: any) =>

              _.includes(allowedPropertyIds, propertyList._id)

            );

          } else {

            this.masterList['propertyList'] = res.propertyList.data;

          }

        }

        if(res.unitList?.status == 'ok') {
        
          if (this.userDetails?.userType == 'owner' || this.userDetails?.userType == 'manager') {
          
            this.masterList['unitList'] = _.filter(res.unitList?.data, (unit: any) =>
  
              _.includes(this.userDetails?.propertyIds, unit?.propertyName?._id)
  
            );
  
          } else {
  
            this.masterList['unitList'] = res.unitList?.data;
  
          }

        } 

        this.loadForm();

      }
  
    });

  }

  loadForm(){

    this.formSubmitted = false;

    this.utilityBillForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'property': [ this.editData.property?._id || null, Validators.required ],
      
      'unit': [ this.editData.unit?._id || null, Validators.required ],
      
      // 'utility': [ this.editData.utility?._id || null, Validators.required ],
      
      'amountDue': [ this.editData?.amountDue || '' ],
      
      'billDate': [ this.editData?.billDate || '' ],

      'dueDate': [ this.editData?.dueDate || '' ],
      
      'invoiceNo': [ this.editData?.invoiceNo || '' ],
      
      'status': ['Not Yet Due']
    
    });

    this.changeValue('propertyName');

  }

  get f(): any { return this.utilityBillForm.controls; }

  getPropertyTaxBillList(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    // let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true };

    let filterValues = _.pickBy(this.filterForm.getRawValue());
  
    this.service.changePayloadDateFormat({'data': filterValues, 'fields': ['billStartDate', 'billEndDate', 'dueStartDate', 'dueEndDate' ]})

    if (_.includes(filterValues['status'], true)) {

      filterValues['is_active'] = true;

    }  else {

      _.isEmpty(filterValues['status']) ? '' : filterValues['is_active'] = false;

    }

    const selectedStatuses = _.map(_.filter(this.statusOptions, { checked: true }), 'value');

    const allChecked = _.every(this.statusOptions, { checked: true });

    if (!allChecked) {

      filterValues['status'] = selectedStatuses;

    } else {

      filterValues = _.omit(filterValues, 'status');

    }

    let payload: any =  { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true, ...filterValues };

    if (this.userDetails.userType == 'tenant') {

      payload = { ...payload, 'unit': this.userDetails?.unitName };

    } else if (this.userDetails.userType == 'admin') {

      payload = { ...payload };
      
    } else {
      
      payload = { ...payload, 'propertyIds': this.userDetails?.propertyIds };

    }
    
    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url': '/property-Tax-bill/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['propertyTaxBill'] = res.data;

        console.log('Property Tax List', this.masterList['propertyTaxBill']);
        
        this.totalCount = res.data.totalCount || res.totalCount || 0;
        
      }

    });

  }

  getUtilityStatus(item: any): string {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(item?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    const amountDue = item?.amountDue ?? item?.taxAmount ?? 0;

    const amountPaid = item?.amountPaid ?? 0;

    if (amountPaid >= amountDue && amountDue > 0) {

      return 'Paid';

    }

    const dueMonth = dueDate.getMonth();

    const dueYear = dueDate.getFullYear();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    if (dueYear == currentYear && dueMonth == currentMonth) {

      if (dueDate >= today) return 'Upcoming';

      else return 'Overdue';

    }

    if (dueDate > today) return 'Not yet Due';

    return 'Overdue';

  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getPropertyTaxBillList();
  
  }

  isSelected(controlName: string, id: string): boolean {

    const selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  changeValue(fieldName?: string, index?: number) {

    if (fieldName == 'propertyName') {
    
      const selectedPropertyId = Array.isArray(this.f.property.value) ? this.f.property.value[0] : this.f.property.value;

      this.filteredUnitList = _.filter(this.masterList['unitList'], (unit: any) => {

        return unit?.propertyName?._id == selectedPropertyId;
      
      });

      if (this.mode == 'Update' && this.editData?.unit?._id) {

        const validUnit = _.find(this.filteredUnitList, { _id: this.editData.unit._id });
        
        this.f.unit.setValue(validUnit ? validUnit._id : null);
      
      } else {
      
        this.f.unit.setValue(null);
      
      }
    
    }

  }

  editBill(index: number) {

    const bill = this.masterList['propertyTaxBill'][index];

    this.editData = bill;

    this.mode = 'Update';
    
    this.editingRowIndex = index;

    this.loadForm();

    this.getPropertyTaxBillList();

  }

  submit() {

    this.formSubmitted = true;

    if(this.utilityBillForm.invalid) return;
  
    let payload = this.utilityBillForm.value;
    
    if (this.mode == 'Update') {

      payload['isPayment'] = false;

    } 

    this.service.changePayloadDateFormat({ "data": payload, "fields": ['billDate', 'dueDate']});

    console.log('Payload', payload);

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result' : _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/property-Tax-bill/create', payload }) : 
        
          this.service.patchService({ 'url': `/property-Tax-bill/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });

              this.utilityBillForm?.reset()

              this.getPropertyTaxBillList();

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': `${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })
    
  }

  deleteBill(data: any) {

    this.confirmationDialog
    
    .confirm({ message: 'Do you want to Delete?', type: 'error', title: 'Delete' })
    
    .then((confirmed: any) => {
    
      if (confirmed) {
    
        this.service.deleteService('/property-Tax-bill/' + data?._id).subscribe((res: any) => {
    
          this.service.showToastr({
    
            data: { message: `${res.message}`, type: res.status == 'ok' ? 'success' : 'info' }
    
          });
    
          this.getPropertyTaxBillList();
    
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

    let params = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };

    this.service.getFile({ "url": "/getPropertyTaxBillExcel", params }).subscribe((res: any) => {

      const url = window.URL.createObjectURL(res);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'Utility Bill List.xlsx';

      a.click();

    });

  }

}

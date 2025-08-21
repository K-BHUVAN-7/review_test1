import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './report-export.component.html',
  styleUrl: './report-export.component.scss'
})
export class ReportExportComponent {

  @ViewChild('customReportModal') customReportModal!: TemplateRef<any>;
  
  constructor(private router: Router, private route: ActivatedRoute, public service: CommonService, private modalService: NgbModal, private fb: FormBuilder,) {}

  _: any = _;
  modalRef!: NgbModalRef;
  permissions: any = {};
  masterList: any = {};
  editData: any = {};
  userDetails: any = {};
  reportType: string = '';
  queryParamsValue: any = {};
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  filterForm: FormGroup = new FormGroup({});
  filteredUnitList: any[] = [];
  filteredTenantList: any[] = [];
  filterDateRange: boolean = false;

  dateRangeList: any = [
    { name: 'Custom Date Range', value: 'customDateRange' },
    { name: 'Last 7 Days', value: 'last7Days' },
    { name: 'Weekly', value: 'weekly' },
    { name: 'Last 30 Days', value: 'last30Days' },
    { name: 'Monthly', value: 'monthly' },
    { name: 'Quarterly', value: 'quarterly' },
    { name: 'Half Yearly', value: 'halfYearly' },
    { name: 'Yearly', value: 'yearly' },
  ];

  // reportData: any = [];

  reportData: any = [
    {
      'propertyName': 'Casagrand',
      'unit': 'A 101',
      'tenantName': 'Vignesh',
      'lastDueDate': '2025-07-24T00:00:00.000Z',
      'rentAmt': '15000',
      'paidAmt': '10000',
      'frequency': 'Monthly',
      'paymentMode': 'Cash',
      'isPdc': false,
      'pdcDate': ''
    },
    {
      'propertyName': 'Casagrand New',
      'unit': 'A 101',
      'tenantName': 'Nisanth',
      'lastDueDate': '2025-07-30T00:00:00.000Z',
      'rentAmt': '85000',
      'paidAmt': '40000',
      'frequency': 'Quartaly',
      'paymentMode': 'Cheque',
      'isPdc': true,
      'pdcDate': "2025-07-30T00:00:00.000Z"
    },
    {
      'propertyName': 'Casagrand',
      'unit': 'A 102',
      'tenantName': 'Gowthan',
      'lastDueDate': '2025-08-30T00:00:00.000Z',
      'rentAmt': '15000',
      'paidAmt': '',
      'frequency': 'Monthly',
      'paymentMode': 'Cash',
      'isPdc': false,
      'pdcDate': ''
    },
    {
      'propertyName': 'Casagrand',
      'unit': 'A 103',
      'tenantName': 'Kesavan',
      'lastDueDate': '2025-08-24T00:00:00.000Z',
      'rentAmt': '15000',
      'paidAmt': '10000',
      'frequency': 'Monthly',
      'paymentMode': 'Cash',
      'isPdc': false,
      'pdcDate': ''
    }
  ];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.reportType = params['reportType'];

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Property"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
            
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []
    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');
    
    this.getReportList();

    this.getAllDetails();

    this.loadForm();

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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'tenantList': this.service.postService({ 
        
        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
  
        if (res.propertyList?.status == 'ok') {
        
          if (this.userDetails.userType == 'manager' || this.userDetails.userType == 'owner') {

            let allowedPropertyIds = _.map(this.userDetails.propertyIds);

            this.masterList['propertyList'] = _.filter(res.propertyList.data, (propertyList: any) =>

              _.includes(allowedPropertyIds, propertyList._id)

            );

          } else {

            this.masterList['propertyList'] = res.propertyList.data;

          }

        }

        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.tenantList?.status == 'ok') this.masterList['tenantList'] = res.tenantList.data || [];

      }
  
    });

  }
  
  loadForm() {

    this.filterForm = this.fb.group({
  
      'parentCompanyId': [this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required],
  
      'companyId': [this.editData.companyId || this.companyId, Validators.required],
  
      'branchId': [this.editData.branchId || this.branchId, Validators.required],

      'propertyName': [ '' ],

      'unitName': [ '' ],

      'tenantName': [ '' ],

      'reportType': [ '' ],

      'dateRange': [''],

      'startDate': [''],

      'endDate': [''],
  
    });

    this.filterForm.get('dateRange')?.valueChanges.subscribe((value: any)=>{

      let dates = this.getDatesForPeriod(value);

      if(!_.isEmpty(value)) {

        if(value == 'customDateRange'){

          this.filterDateRange = true;

          this.filterForm.patchValue({
    
            'startDate': '',
    
            'endDate': ''
    
          });

        }else {

          this.filterDateRange = false;

          this.filterForm.patchValue({
    
            'startDate': dates.startDate,
    
            'endDate': dates.endDate
    
          });

        }

      } 

    });
    
  }
  
  get f(): any { return this.filterForm.controls; }

  getReportList() {

    if(_.size(this.masterList['companyList']) > 1) {
                
      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    } else {

      this.companyId = this.companyId;

    }

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'reportType': this.reportType };

    let params = { 'pageIndex': this.pageIndex, 'pageSize': this.pageSize, 'searchValue': this.searchValue };

    this.service.postService({ url: '/reports/list', payload, params }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.reportData = res.data || [];

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }
      
    });

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }):any {
  
    if (fieldName == 'propertyName') {
    
      let selectedPropertyId = Array.isArray(this.f.propertyName.value) ? this.f.propertyName.value[0] : this.f.propertyName.value;

      this.filteredUnitList = _.filter(this.masterList['unitList'], (unit: any) => {

        return unit?.propertyName?._id == selectedPropertyId;
      
      });
    
    }

    if (fieldName == 'unitName') {
    
      let selectedUnitId = Array.isArray(this.f.unitName.value) ? this.f.unitName.value[0] : this.f.unitName.value;

      this.filteredTenantList = _.filter(this.masterList['tenantList'], (tenant: any) => {

        return tenant?.unitName?._id == selectedUnitId;
      
      });
    
    }

  }

  getDatesForPeriod(period: string) {

    const today = moment();

    let startDate, endDate;

    switch (period) {

      case 'last7Days':

        startDate = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
        
        endDate = today.format('YYYY-MM-DD');
      
      break;

      case 'weekly':

        startDate = today.clone().startOf('week').format('YYYY-MM-DD');

        endDate = today.clone().endOf('week').format('YYYY-MM-DD');

      break;
  
      case 'last30Days':
        
        startDate = today.clone().subtract(30, 'days').format('YYYY-MM-DD');
        
        endDate = today.format('YYYY-MM-DD');
        
      break;

      case 'monthly':

        startDate = today.clone().startOf('month').format('YYYY-MM-DD');

        endDate = today.clone().endOf('month').format('YYYY-MM-DD');

      break;

      case 'quarterly':

        startDate = today.clone().startOf('quarter').format('YYYY-MM-DD');

        endDate = today.clone().endOf('quarter').format('YYYY-MM-DD');
        
      break;

      case 'halfYearly':

        const currentMonth = today.month();

        if (currentMonth < 6) {

          startDate = today.clone().startOf('year').format('YYYY-MM-DD');

          endDate = today.clone().month(5).endOf('month').format('YYYY-MM-DD');

        } else {

          startDate = today.clone().month(6).startOf('month').format('YYYY-MM-DD');

          endDate = today.clone().endOf('year').format('YYYY-MM-DD');

        }

      break;

      case 'yearly':

        startDate = today.clone().startOf('year').format('YYYY-MM-DD');

        endDate = today.clone().endOf('year').format('YYYY-MM-DD');

      break;

      // default:

      //   startDate = moment(this.service.setupConfigurations.yearStartDate).format('YYYY-MM-DD');

      //   endDate = moment(this.service.setupConfigurations.yearEndDate).format('YYYY-MM-DD');

      // break;

    }

    return { startDate, endDate };

  }

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getReportList();
  
  }

  openCustomReportModal(data?: any) {

    this.modalRef = this.modalService.open(this.customReportModal, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    
  }

  // closeCustomReportModal() {

  //   this.modalRef?.close();

  //   this.loadForm();

  // }

  exportToExcel() {

    this.service.getFile({

      url: `/export/report`,

      params: { data: JSON.stringify(this.reportData), reportType: this.reportType }

    }).subscribe((res: any) => {

      let url = window.URL.createObjectURL(res);

      let a = document.createElement('a');

      a.href = url;

      a.download = `${this.reportType}.xlsx`;

      a.click();

    }, (error) => {

      console.error('Export error:', error);

      // Handle export error (e.g., show a notification)

    });

  }

}

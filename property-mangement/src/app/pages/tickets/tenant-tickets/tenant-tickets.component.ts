import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tenant-tickets',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './tenant-tickets.component.html',
  styleUrl: './tenant-tickets.component.scss'
})
export class TenantTicketsComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private fb: FormBuilder) { } 

  @ViewChild('feedBackModal') feedBackModal!: TemplateRef<any>;

  @ViewChild('viewTicketsModal') viewTicketsModal!: TemplateRef<any>;

  @ViewChild('escalateModal') escalateModal!: TemplateRef<any>;
    
  filterForm: FormGroup = new FormGroup({});
  masterList: any = {};
  mode: any = 'Create'
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;
  modalRef!: NgbModalRef; 

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  pageSizeArr: any = [];
  totalCount: number = 0;
  searchValue: any = "";
  rowId: any = {};

  selectedTicket: any = null;
  stars = Array(5).fill(0);
  selectedRating = 1;
  feedbackDescription: string = '';
  escalatedDesc: any = '';
  activeModalType: 'feedback' | 'escalate' | null = null;
  
  // tatSliderMin = 0;
  // tatSliderMax = 0;
  // tatMinValue = 0;
  // tatMaxValue = 0;

  statusOptions = [
    { label: 'Pending', value: 'pending', checked: true },
    { label: 'Resolved', value: 'resolved', checked: true },
    { label: 'Closed', value: 'closed', checked: true },
    { label: 'Assigned', value: 'assigned', checked: true },
    { label: 'Feedback', value: 'feedBack', checked: true },
  ];

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Tickets"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
            
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getAllDetails();

    this.getTicketsList();

    this.initForm();

  }

  initForm(){

    this.filterForm = this.fb.group({

      'propertyName': "",

      'unitName': "",

      // 'tatMin': [this.tatMinValue],

      // 'tatMax': [this.tatMaxValue],
    
      'raisedStartDate': '',
      
      'raisedEndDate': '',

      'completedStartDate': '',

      'completedEndDate': '',

      'staffName': '',

      'status': '',

    });

    this.getTicketsList();

  }

  // onTatSliderChange() {

  //   if (this.tatMinValue > this.tatMaxValue) {
    
  //     [this.tatMinValue, this.tatMaxValue] = [this.tatMaxValue, this.tatMinValue];
    
  //   }

  //   const minPercent = ((this.tatMinValue - this.tatSliderMin) / (this.tatSliderMax - this.tatSliderMin)) * 100;
    
  //   const maxPercent = ((this.tatMaxValue - this.tatSliderMin) / (this.tatSliderMax - this.tatSliderMin)) * 100;

  //   // Update only amount sliders CSS
  //   const sliders = document.querySelectorAll('.amount-slider') as NodeListOf<HTMLInputElement>;
    
  //   sliders.forEach(slider => {
    
  //     slider.style.setProperty('--start', `${minPercent}%`);
    
  //     slider.style.setProperty('--end', `${maxPercent}%`);
    
  //   });

  //   this.filterForm.patchValue({
    
  //     'tatMin': this.tatMinValue,
    
  //     'tatMax': this.tatMaxValue
    
  //   });

  // }
  
  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'manager' ? { 'manager': this.userDetails.id } : {}), ...(this.userDetails.userType == 'owner' ? { 'owner': this.userDetails.id } : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
        'loaderState': true

      }),
      
      'staff': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff', is_active: true },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.unitList?.status == 'ok') {
        
          if (this.userDetails?.userType == 'owner' || this.userDetails?.userType == 'manager') {
          
            this.masterList['unitList'] = _.filter(res.unitList?.data, (unit: any) =>
  
              _.includes(this.userDetails?.propertyIds, unit?.propertyName?._id)
  
            );
  
          } else {
  
            this.masterList['unitList'] = res.unitList?.data;
  
          }

        } 
        
        // if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];
        
        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;

      }
  
    });

  }

  isSelected(controlName: string, id: string): boolean {

    const selectedItems = this.filterForm.get(controlName)?.value || [];
    
    return selectedItems.includes(id);
  
  }

  onPageChange(event: PageEvent): void {

    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
    this.getTicketsList();
  
  }

  openModal(data?:any){

    const queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/tickets/tenant-tickets/add-tenant-issue', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/tickets/tenant-tickets/add-tenant-issue' }); 
        
    }
      
  }

  setRating(rating: number) {

    this.selectedRating = rating;
  
  }

  getTicketsList(){

    if(_.size(this.masterList['companyList'])>1) {
        
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());

    this.service.changePayloadDateFormat({'data': filterValues, 'fields': ['raisedStartDate', 'raisedEndDate', 'completedStartDate', 'completedEndDate' ]})

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

    let payload =  { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, 'unitName': this.userDetails?.unitName, ...filterValues };

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({'url': '/tickets/list', payload, params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['tenatTicketList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  openfeedBackModal(ticket: any) {

    this.selectedTicket = ticket;

    this.selectedRating = 0;

    this.feedbackDescription = '';

    this.activeModalType = 'feedback';

    this.modalRef = this.modalService.open(this.feedBackModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });

  }

  openEscalateModal(ticket: any) {

    this.selectedTicket = ticket;

    this.escalatedDesc = '';

    this.activeModalType = 'escalate';

    this.modalRef = this.modalService.open(this.escalateModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });

  }

  isOverdue(tenant: any): boolean {

    if (tenant.ticketStatus == 'resolved') {

      return false;

    }

    let issueDate = new Date(tenant.issueRaisedDate);

    let today = new Date();

    let diffTime = Math.abs(today.getTime() - issueDate.getTime());

    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > tenant.tat;

  }

  openviewTicketsModal(data?: any) {

    this.selectedTicket = data;

    this.modalService.open(this.viewTicketsModal, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });

  }

  deleteTenantTicket(data:any) {

    this.confirmationDialog.confirm({ 'message': 'Do you want to Delete?', 'type': 'error' , title : 'Delete'  }).then((confirmed: any) => {

      if(confirmed) {
        
        this.service.deleteService( "/tickets/"+ data?._id).subscribe((res: any) => {

          if(res.status=='ok') {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'success' } });
            
            this.getTicketsList()

          } else {

            this.service.showToastr({ 'data' : { 'message': `${res.message}`, 'type': 'info' } });

            this.getTicketsList();

          }

        });

      }

    });

  }

  updateTenanantTicket(actionType: 'submit' | 'reopen' = 'submit') {

    if (!this.selectedTicket || !this.activeModalType) return;

    let payload: any = { ...this.selectedTicket };

    if(actionType == 'reopen'){

      payload = { ...payload, 'ticketStatus': 'assigned', 'isReOpen': true }

    }else {

      if (this.activeModalType == 'feedback') {
  
        payload = {...payload, 'feedbackRating': this.selectedRating, 'feedbackDescription': this.feedbackDescription };
  
      } else if (this.activeModalType == 'escalate') {
  
        payload = {...payload, 'escalatedRemarks': this.escalatedDesc, isEscalated: true };
  
      }

    }

    const formData = new FormData();

    formData.append('data', JSON.stringify(payload));

    this.service.patchService({ 'url': `/tickets/${payload?._id}`, payload : formData }).subscribe((res: any) => {

      if(res.status == 'ok') {
        
        this.modalRef.close();

        this.getTicketsList();

        this.escalatedDesc = '';

      }

    });

  }

  xlDownload(){

    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;
    }

    let params = { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, 'unitName': this.userDetails?.unitName };

    this.service.getFile({ "url": "/getTenantTicketsExcel", params }).subscribe((res: any) => {

      const url = window.URL.createObjectURL(res);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'Tenant Tickets List.xlsx';

      a.click();

    });

  }

}

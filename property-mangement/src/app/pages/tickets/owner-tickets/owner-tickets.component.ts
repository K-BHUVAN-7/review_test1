import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-owner-tickets',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './owner-tickets.component.html',
  styleUrl: './owner-tickets.component.scss'
})
export class OwnerTicketsComponent {

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private fb: FormBuilder) { } 
  
  @ViewChild('assignModal') assignModal!: TemplateRef<any>;
  
  // @ViewChild('feedBackModal') feedBackModal!: TemplateRef<any>;

  @ViewChild('viewModal') viewModal!: TemplateRef<any>;

  @ViewChild('resolcedRemarksModal') resolcedRemarksModal!: TemplateRef<any>;
    
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

  stars = Array(5).fill(0);
  selectedRating = 0;
  selectedTicket: any = null;

  tat = {
    value: 2,
    unit: 'day'
  };

  totalCount: number = 0;
  filterForm: FormGroup = new FormGroup({});

  // tatSliderMin = 0;
  // tatSliderMax = 15;
  // tatMinValue = 0;
  // tatMaxValue = 15;

  statusOptions = [
    { label: 'Pending', value: 'pending', checked: true },
    { label: 'Resolved', value: 'resolved', checked: true },
    { label: 'Closed', value: 'closed', checked: true },
    { label: 'Assigned', value: 'assingned', checked: true },
    { label: 'Feedback', value: 'feedBack', checked: true },
  ];

  managerList: any = [
    { value: 'pending', label: 'Pending' },
    { value: 'assign', label: 'Assign' },
    { value: 'closed', label: 'Closed' },
    { value: 'resolved', label: 'Resolved' },
  ]

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

  onPageChange(event: PageEvent): void {
  
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;
  
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
  
  openModal(data?:any){

    const queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/tickets/manager-tickets/edit-manager-ticket', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/tickets/manager-tickets/edit-manager-ticket' }); 
        
    }
      
  }
  
  // onManagerChange(event: Event) {

  //   const selectedValue = (event.target as HTMLSelectElement).value;
    
  //   if (selectedValue == 'assign') {

  //     this.modalService.open(this.assignModal, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    
  //   }
  
  // }
  
  onManagerChange(event: Event, selectedRow?: any) {

    const selectedValue = (event.target as HTMLSelectElement).value;
  
    if (selectedValue == 'assign') {
    
      this.selectedTicket = selectedRow;
    
      this.modalService.open(this.assignModal, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });
    
    }

    if (selectedValue == 'resolved') {
    
      // this.selectedTicket = selectedRow;
    
      this.modalService.open(this.resolcedRemarksModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
    }
  
  }
  
  setRating(rating: number) {

    this.selectedRating = rating;
  
  }
  
  getTicketsList(){

    if(_.size(this.masterList['companyList'])>1) {
          
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId =  this.companyId;

    }

    let filterValues = _.pickBy(this.filterForm.getRawValue());

    if (_.includes(filterValues['status'], true)) {

      filterValues['is_active'] = true;

    }  else {

      _.isEmpty(filterValues['status']) ? '' : filterValues['is_active'] = false;

    }

    const selectedStatuses = _.map(_.filter(this.statusOptions, { checked: true }), 'value');

    const allChecked = _.every(this.statusOptions, { checked: true });

    if (!allChecked) {

      filterValues['status'] = selectedStatuses;

    }else {

      filterValues = _.omit(filterValues, 'status');

    }
  
    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, 'propertyIds': this.userDetails?.propertyIds, ...filterValues };

    this.service.postService({'url': '/tickets/list', payload }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['ownerTicketList'] = res.data;

        this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  // openfeedBackModal() {

  //   this.modalService.open(this.feedBackModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });

  // }

  openviewModal(data?:any) {

    this.selectedTicket = data;

    this.modalService.open(this.viewModal, { centered: true, size: 'lg', backdrop: 'static', keyboard: false });

  }
  
  openresolcedRemarksModal() {

    this.modalService.open(this.resolcedRemarksModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });

  }

  isOverdue(owner: any): boolean {

    if (owner.ticketStatus == 'resolved') {

      return false;

    }

    let issueDate = new Date(owner.issueRaisedDate);

    let today = new Date();

    let diffTime = Math.abs(today.getTime() - issueDate.getTime());

    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > owner.tat;

  }

  xlDownload(){
  
    if(_.size(this.masterList['companyList'])>1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;
    }

    let params = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'staffName': this.userDetails?.id };

    this.service.getFile({ "url": "/getOwnerTicketsExcel", params }).subscribe((res: any) => {

      const url = window.URL.createObjectURL(res);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'Owner Tickets List.xlsx';

      a.click();

    });

  }

}

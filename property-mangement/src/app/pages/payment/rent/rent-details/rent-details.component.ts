import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rent-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './rent-details.component.html',
  styleUrl: './rent-details.component.scss'
})
export class RentDetailsComponent {

  @ViewChild('detailHistoryModal') detailHistoryModal!: TemplateRef<any>;

  @ViewChild('rentApproveModal') rentApproveModal!: TemplateRef<any>;
  toastr: any;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService, private modalService: NgbModal, private route: ActivatedRoute) { } 
    
  masterList: any = {};
  mode: any = 'Create'
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;
  modalRef!: NgbModalRef;

  pageIndex: number = 0;
  pageSize: number = 10;
  searchValue: any = "";
  totalCount: number = 0;

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  rentDetailList: any = {};
  selectedData: any = {};
  selectPaymentEntry: any = {};

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      let tenantId = params['tenantId'];

      let unitId = params['unitId'];

      if (tenantId && unitId) {

        this.getRentDetails(tenantId, unitId);

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Payment", 'Rent'], isNeedBranchList: true, 'permission': ['create','view','edit','delete', 'approve']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

  }

  isAnyBillNotApproved(paymentEntries: any[]): boolean {

    return paymentEntries.some(entry => !entry.isApproved && !entry.isRejected);

  }

  areAllBillsApproved(paymentEntries: any[]): boolean {

    return paymentEntries.length > 0 && paymentEntries.every(entry => entry.isApproved);

  }

  shouldShowApproveButton(rent: any): boolean {

    const hasPending = this.isAnyBillNotApproved(rent?.paymentEntries);

    return this.permissions?.approvePermission?.branchList?.length > 0 && hasPending;

  }

  shouldShowApprovePending(rent: any): boolean {

    const hasPending = this.isAnyBillNotApproved(rent?.paymentEntries);

    return this.permissions?.approvePermission?.branchList?.length == 0 && hasPending;

  }

  shouldShowPayButton(rent: any): boolean {

    if (rent.amountPaid >= rent.amountDue) return false;

    if (!rent.paymentEntries || rent.paymentEntries.length == 0) return true;

    return !this.isAnyBillNotApproved(rent.paymentEntries);

  }

  getRentDetails(tenantId?: string, unitId?: string): void {

    // let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ url: '/payment/rental/list', payload: { 'tenantId': tenantId, 'unit': unitId } }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['detailRentList'] = res.data;

        // this.totalCount = res.data.totalCount || res.totalCount || 0;

      }

    });

  }

  getRentStatus(rent: any): string {
    
    let today = new Date();
    
    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(rent?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = rent?.amountDue ?? 0;

    let amountPaid = rent?.amountPaid ?? 0;

    if (rent?.status === 'Free') return 'Free';

    if (amountPaid >= amountDue && amountDue > 0) return 'Paid';

    let dueMonth = dueDate.getMonth();

    let dueYear = dueDate.getFullYear();

    let currentMonth = today.getMonth();

    let currentYear = today.getFullYear();

    if (dueYear == currentYear && dueMonth == currentMonth) {

      if (dueDate >= today) return 'Upcoming';

      else return 'Overdue';

    }

    if (dueDate > today) return 'Not yet Due';

    return 'Overdue';

  }

  openHistoryModal(data?: any) {

    this.selectedData = data;

    this.modalService.open(this.detailHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }
  
  openRentApproveModal(data?: any) {

    this.selectedData = data;

    this.selectPaymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    this.modalRef = this.modalService.open(this.rentApproveModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
  }

  openUpdatePaymentModal(data?: any){

    this.service.navigate({ 'url': 'app/payment/rent/update-payment', queryParams: { id: data } });

  }

  approveRent(data?: any) {

    let paymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    let updatedPaymentEntry = { ..._.omit(paymentEntry, ['_id', 'requestedBy', 'revisedAmount', 'reverseAmt']), isApproved: true, isApprovalUser: true };

    let payload: any = updatedPaymentEntry;

    let params: any = { 'type': 'rent' };
    
    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['paymentDate']});

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Approve this document?",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${paymentEntry?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ data: { message: 'Approved Successfully', type: 'success' } });

            this.service.navigate({ url: 'app/payment/rent' });

            this.modalRef.close();

          }

        });

      }

    })

  }

  rejectRent(data?: any) {

    let paymentEntry = _.find(data?.paymentEntries, { isApproved: false }) || data;

    let updatedPaymentEntry = { ..._.omit(paymentEntry, ['_id', 'requestedBy', 'revisedAmount', 'reverseAmt']), isRejected: true, isApprovalUser: true };

    let payload: any = updatedPaymentEntry;

    let params: any = { 'type': 'rent' };
    
    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['paymentDate']});

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to Reject this document?",

      type: "info",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/payment/status/${paymentEntry?._id}`, payload, params }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.service.showToastr({ "data": { "message": `Rejected Successfully`, "type": "success" } });

            this.service.navigate({ 'url': 'app/payment/rent' });

            this.modalRef.close();

          }

        });

      }

    })

  }

  openRentModal(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/payment/rent', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/payment/rent' }); 
        
    }
      
  }

  onPageChange(event: PageEvent): void {
    
    this.pageIndex = event.pageIndex;
  
    this.pageSize = event.pageSize;

    this.getRentDetails();
  
  }

}

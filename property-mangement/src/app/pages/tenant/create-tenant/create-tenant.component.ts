import { Component, TemplateRef, ViewChild } from '@angular/core';
import { onLog } from '@angular/fire/app';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import { forkJoin } from 'rxjs';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'Uploading' | 'Completed';
}

@Component({
  selector: 'create-tenant',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-tenant.component.html',
  styleUrl: './create-tenant.component.scss'
})
export class CreateTenantComponent {
moment(arg0: any) {
throw new Error('Method not implemented.');
}

  @ViewChild('pdcModal') pdcModal!: TemplateRef<any>;

  @ViewChild('detailHistoryModal') detailHistoryModal!: TemplateRef<any>;

  @ViewChild('rentApproveModal') rentApproveModal!: TemplateRef<any>;

  constructor(private fb: FormBuilder, public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute,private sanitizer: DomSanitizer, private modalService: NgbModal) { } 

  modalRef!: NgbModalRef;
  tenantForm: FormGroup = new FormGroup({});
  pdcForm: FormGroup = new FormGroup({});
  editData:any = {};
  isDragOver : Boolean = false;
  isPdfPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  _: any = _;
  userDetails: any = {};
  formSubmitted : Boolean = false;
  masterList : any = {}
  mode : string = "Create";
  queryParamsValue: any = {};
  regularDocumentFiles: UploadFile[] = [];
  contractFiles: UploadFile[] = [];
  companyId: any = {};
  branchId: any = {}
  branchList: any = {};
  permissions : any = {};

  contractDate: any = moment();
  selectedData: any = [];
  dueDateError: any = '';

  minContractEndDate: Date | null = null;
  editPdcIndex: number | null = null;

  filteredUnitList: any[] = [];
  filteredUtilityBill: any[] = [];
  
  minDate: any;

  genderList: any = [
    { value: 'Male'},
    { value: 'Female'},
    { value: 'Others'},
  ];

  categoryList: any = [
    { value: 'VIP'},
    { value: 'Normal'},
  ];

  chargeTypeList: any = [
    { value: 'Advance' },
    { value: 'Arrear' }
  ]

  rentalTypeList: any = [
    { value: 'Recurring' },
    { value: 'Lease' },
  ]

  frequencyList: any = [
    { value: 'Monthly' },
    { value: 'Quarterly' },
    { value: 'Annually' },
  ]

  // paymentModeList: any = [
  //   { value: 'UPI' },
  //   { value: 'Cheque' },
  //   { value: 'Net Banking' },
  //   { value: 'Cash' }
  // ]

  relationshipList: any = [
    { value: 'Father' },
    { value: 'Mother' },
    { value: 'Son' },
    { value: 'Daughter' },
    { value: 'Others' },
  ]

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({ 'url' : '/otherUser/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId, "_id" : this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

          } 

        })

      } else {

        this.mode == 'Create';

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Tenant"], isNeedBranchList: true, 'permission': ['create','view','edit','delete', 'approve']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []
    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.loadForm();

    this.getAllDetails();
    
    this.initializePdcForm();

    let today = new Date();
    
   this.minDate = today.toISOString().split('T')[0];

  }

  getUtilityStatus(item: any): string {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(item?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = item?.utilityAmount ?? item?.taxAmount ?? 0;

    let amountPaid = item?.amountPaid ?? 0;

    if (amountPaid >= amountDue && amountDue > 0) {

      return 'Paid';

    }

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

    return this.areAllBillsApproved(rent.paymentEntries);

  }




  
  // isAnyBillNotApproved(paymentEntries: any[]): boolean {

  //   return _.some(paymentEntries, entry => !entry?.isApproved && !entry?.isRejected);
    
  // }

  // shouldShowApproveButton(rent: any): boolean {

  //   let hasPending = _.some(rent?.paymentEntries, entry => !entry?.isApproved && !entry?.isRejected);

  //   return this.userDetails?.userType == 'manager' && hasPending;
    
  // }

  // shouldShowPayButton(rent: any): boolean {

  //   let notApproved = this.isAnyBillNotApproved(rent?.paymentEntries);

  //   if (rent.amountPaid >= rent.amountDue) return false;

  //   if (this.userDetails?.userType == 'tenant' || this.userDetails?.userType == 'manager') {

  //     return !notApproved;

  //   }

  //   return false;

  // }





  isDateReadOnly(contractStartDate: string): boolean {

    if (!contractStartDate) return false;
    
    let today = moment().startOf('day');
    
    let startDate = moment(contractStartDate).startOf('day');
    
    return startDate.isBefore(today);
  
  }

  isSelected(id: string, controlName: string): boolean {

    let selected = this.tenantForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }
  
  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'countryIdList': this.service.getService({ "url": "/countries" }),
      
      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),
      
      'rolesList': this.service.postService({'url' : '/master/roles/list', payload: {'parentCompanyId' : this.userDetails.parentCompanyId } }),
      
      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'issue': this.service.postService({ 

        "url": "/master/issue/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'staff': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff' },
        
        'loaderState': true

      }),

      'manager': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager' },
        
        'loaderState': true

      }),

      'idProof': this.service.postService({ 

        "url": "/master/idProof/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'utilityBill': this.service.postService({ 

        "url": "/utility-bill/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
  
        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || [];

        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];

        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;
        
        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;

        // if(res.manager?.status == 'ok') this.masterList['managerList'] = res.manager.data;

        if(res.idProof?.status == 'ok') this.masterList['idProofList'] = res.idProof.data;
        
        if(res.utilityBill?.status == 'ok') this.masterList['utilityBill'] = res.utilityBill.data;

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

        if (res.manager?.status == 'ok') {
        
          if (this.userDetails.userType == 'manager') {

            let manager = _.find(res.manager.data, ['_id', this.userDetails.id]);

            this.masterList['managerList'] = manager ? [manager] : [];

          } else {

            this.masterList['managerList'] = res.manager.data;

          }

        }

        this.mode == 'Update' ? this.loadForm() : ''

      }
  
    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.tenantForm = this.fb.group({
  
      'parentCompanyId': [this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required],
  
      'companyId': [this.editData.companyId || this.companyId, Validators.required],
  
      'branchId': [this.editData.branchId || this.branchId, Validators.required],
  
      'userType': [this.editData.userType || 'tenant'],
  
      'propertyName': [_.map(this.editData?.propertyName, '_id') || null, Validators.required],

      // 'propertyName': [ this.editData?.propertyName?._id || null, Validators.required],
  
      'unitName': [this.editData?.unitName?._id || null ],
  
      'firstName': [this.editData?.firstName || '', Validators.required],
  
      'lastName': [this.editData?.lastName || '', Validators.required],
  
      'email': [this.editData?.email || '', [Validators.required, Validators.email]],
  
      'gender': [this.editData?.gender || null, Validators.required],
  
      'mobileNo': [this.editData?.mobileNo || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  
      'categories': [this.editData?.categories || null],
  
      'age': [this.editData?.age || ''],
  
      'role': [this.editData?.role?._id || null],

      'contractDetails': this.fb.array([]),

      'regularDocument': this.fb.array([]),
  
      'contractDocuments': this.fb.array([]),
  
      'tenantMembers': this.fb.array([]),
  
      'tenantIdProof': this.fb.array([]),
  
      'issueConfiguration': this.fb.array([]),
  
      'pdcList': this.fb.array([]),
      
    });

    // if (this.mode == 'Update') {

    //   this.tenantForm?.patchValue({

    //     'unitName': this.editData?.unitName?._id

    //   });
      
    // }

    this.tenantForm.get('unitName')?.valueChanges.subscribe((unitId) => {
  
      let isUnitSelected = !unitId;
  
      this.updateContractValidators(isUnitSelected);
  
      // this.onUnitChange(unitId);
    
    });

    if (this.mode == 'Create') {

      this.cd.push(this.getFormArrayFormGroup({ 'formArrayName': 'contractDetails' }));

      this.tm.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantMembers' }));

      this.tip.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantIdProof' }));

      this.cdf.push(this.getFormArrayFormGroup({ 'formArrayName': 'issueConfiguration' }));
    
    }

    if (this.mode == 'Update') {

      this.tenantForm.get('unitName')?.valueChanges.subscribe((unitId) => {

        let isUnitSelected = !unitId;

        this.updateContractValidators(isUnitSelected);

        this.filteredUtilityBill = _.filter(this.masterList['utilityBill'], (bill: any) => {

          return _.toString(_.get(bill, 'unit._id')) == _.toString(unitId);

        });

      });
      
      this.changeValue({fieldName: 'propertyName'});
  
      this.onContractDateChange();
  
      this.cd.clear();

      this.tm.clear();

      this.tip.clear();

      this.cdf.clear();

      _.forEach(this.editData?.tenantMembers, (value: any) => { this.tm.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantMembers', value: value })); });

      _.forEach(this.editData?.tenantIdProof, (value: any) => { this.tip.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantIdProof', value: value })); });

      _.forEach(this.editData?.issueConfiguration, (value: any) => { this.cdf.push(this.getFormArrayFormGroup({ 'formArrayName': 'issueConfiguration', value: value })); });

      if (!_.isEmpty(this.editData?.contractDetails)) {
        
        _.forEach(this.editData?.contractDetails, (value: any) => { this.cd.push(this.getFormArrayFormGroup({ 'formArrayName': 'contractDetails', value: value })) });

      } else {

        this.cd.push(this.getFormArrayFormGroup({ 'formArrayName': 'contractDetails' }));

      }

      if (this.editData?.pdcList?.length) {
  
        this.editData.pdcList.forEach((pdc: any) => {
  
          this.pdcs.push(this.fb.group(pdc));
  
        });

        this.masterList['pdcList'] = _.cloneDeep(this.editData.pdcList);
  
      }

      let isUnitSelected = !this.tenantForm.get('unitName')?.value;
  
      this.updateContractValidators(isUnitSelected);
  
    }

  }

  get f(): any { return this.tenantForm.controls; }

  get pdc(): any { return this.pdcForm.controls; }
  
  get cd(): any { return (<FormArray>this.tenantForm.controls["contractDetails"]) };
  
  get tm(): any { return (<FormArray>this.tenantForm.controls["tenantMembers"]) } 

  get tip(): any { return (<FormArray>this.tenantForm.controls["tenantIdProof"]) } 
  
  get cdf(): any { return (<FormArray>this.tenantForm.controls["issueConfiguration"]) };
  
  get pdcs(): FormArray { return this.tenantForm.get('pdcList') as FormArray; }

  get contractDocuments(): FormArray { return this.tenantForm.get('contractDocuments') as FormArray }
  
  get regularDocuments(): FormArray { return this.tenantForm.get('regularDocument') as FormArray }

  getFormArrayFormGroup({ formArrayName = "", value = {} }: { formArrayName: string, value?: any }) : FormGroup {

    switch(formArrayName) {

      case 'contractDetails': 

        return this.fb.group({ 

          'chargeType': [ value.chargeType || null],

          'rentalType': [ value.rentalType || null],
      
          'frequency': [ value.frequency || null],
      
          'dueDay': [ value.dueDay || '' ],

          'nextDueDay': [ value.nextDueDay || ''],

          'rentalAmt': [ value.rentalAmt || ''],

          'depositAmt': [ value.depositAmt || ''],

          'govtId': [ value.govtId || ''],

          'contractStartDate': [ value.contractStartDate || ''],

          'contractEndDate': [ value.contractEndDate || ''],

          // 'paymentMode': [ value.paymentMode || ''],

          'freeMonths': [ value.freeMonths || ''],
              
        })

      case 'tenantMembers':

        return this.fb.group({

          'memberName': [ value?.memberName || '' ],

          'age': [ value?.age || '' ],

          'gendar': [ value?.gendar || null ],

          'relationship': [ value?.relationship || null ],

        });

      case 'tenantIdProof' :

        return this.fb.group({

          'idProof': [ value?.idProof?._id || null, Validators.required ],

          'idNumber': [ value?.idNumber || '', Validators.required ],

          'expiryDate': [ value?.expiryDate || '', Validators.required ],

        });

      case 'issueConfiguration' :
        
        return this.fb.group({
        
        'issueCategory': [ value?.issueCategory?._id || null,  ],
        
        'priority': [ value?.priority || null ],
        
        'tat': [ value?.tat || '' ],

        "tatType": [ value?.tatType || null ],
        
        'staff': [ _.map(value.staff,'_id') || null ],
        
        'manager': [ _.map(value.manager,'_id') || null ],

        'staffList': [ value?.staff || [] ],

      });

      default: return this.fb.group({});

    }

  }

  initializePdcForm(): void {

    this.pdcForm = this.fb.group({
    
      'parentCompanyId': [this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required],
    
      'companyId': [this.editData.companyId || this.companyId, Validators.required],
    
      'branchId': [this.editData.branchId || this.branchId, Validators.required],
    
      'rentDate': ['', Validators.required],
    
      'amount': ['', Validators.required],
    
      'chequeNo': ['', Validators.required],
    
      'chequeDate': ['', Validators.required],
    
      'bankName': ['', Validators.required],
    
      'bankBranch': ['', Validators.required],
    
    });
  
  }

  updateContractValidators(unitSelected: boolean): void {

    let controlsToUpdate = ['chargeType', 'rentalType', 'frequency', 'dueDay'];

    controlsToUpdate.forEach(controlName => {

      let control = this.tenantForm.get(controlName);

      if (unitSelected) {

        control?.setValidators(Validators.required);

      } else {

        control?.clearValidators();

      }

      control?.updateValueAndValidity();

    });
    
  }

  disableTyping(event: KeyboardEvent) {

    event.preventDefault();
  
  }

  getDueDatesTooltip(): string {

    let dueDates = this.masterList['nextDueDayList'] || [];
    
    return dueDates.map((d: { dueDate: any; }) => d.dueDate).join('\n');
  
  }

  getSelectedDueDate(index?: number): string {
    
    let id = this.cd.at(index)?.get('nextDueDay')?.value;
    
    let match = (this.masterList['nextDueDayList'] || []).find((d: { _id: any; }) => d._id == id);
    
    return match?.dueDate || '';
  
  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }):any {

    if (fieldName == 'propertyName') {
    
      let selectedPropertyId = Array.isArray(this.f.propertyName.value) ? this.f.propertyName.value[0] : this.f.propertyName.value;

      this.filteredUnitList = _.filter(this.masterList['unitList'], (unit: any) => {

        return unit?.propertyName?._id == selectedPropertyId;
      
      });

      if (this.mode == 'Update' && this.editData?.unitName?._id) {

        let validUnit = _.find(this.filteredUnitList, { _id: this.editData.unitName._id });
        
        this.f.unitName.setValue(validUnit ? validUnit._id : null);
      
      } else {
      
        this.f.unitName.setValue(null);
      
      }
    
    }

    if (fieldName == 'issueCategory') {
    
      let rowValue = this.cdf.at(index).value;

      let issue = _.find(this.masterList['issueList'], { '_id': rowValue?.issueCategory });

      let staff = _.filter(this.masterList['staffList'], (e: any) =>
    
        Array.isArray(e.issues) &&
    
        _.some(e.issues, (i: any) => i._id == rowValue?.issueCategory)
    
      );

      this.cdf.at(index).patchValue({
    
        'priority': issue?.priority,
    
        'tat': issue?.tat,
    
        'tatType': issue?.tatType,
    
        'staffList': staff,
    
        // 'manager': issue?.manager?._id,
    
      });
    
    }
  
    if(fieldName == 'contractStartDate' || fieldName == 'contractEndDate' || fieldName == 'frequency'){

      this.onContractDateChange(index);

    }

  }

  openUpdatePaymentModal(data?: any){

    this.service.navigate({ 'url': 'app/payment/rent/update-payment', queryParams: { id: data } });

  }

  openUtilityAmtModal(data?: any){

    this.service.navigate({ 'url': 'app/payment/utility/pay-utility', queryParams: { id: data }  }); 
        
  }

  onContractDateChange(index?: number) {

    let frequency = this.cd.at(index)?.get('frequency')?.value;
    
    let start = this.cd.at(index)?.get('contractStartDate')?.value;

    let end = this.cd.at(index)?.get('contractEndDate')?.value;

    this.dueDateError = ''; // Reset error message

    if (!frequency || !start) {

      this.minContractEndDate = null;
    
      this.masterList['nextDueDayList'] = [];
    
      return;
    
    }

    let startDate = moment(start);
    
    let minEndDate = moment(start);

    switch (frequency) {
    
      case 'Monthly':
    
        minEndDate.add(1, 'month');
    
      break;
    
      case 'Quarterly':
      
        minEndDate.add(3, 'month');
      
      break;

      case 'Annually':
      
        minEndDate.add(1, 'year');
      
      break;
    
    }

    this.minContractEndDate = minEndDate.toDate();

    if (end) {

      let endDateMoment = moment(end);

      if (endDateMoment.isBefore(minEndDate)) {
      
        this.cd.at(index).get('contractEndDate')?.setValue(null);
      
        this.masterList['nextDueDayList'] = [];
      
        return;
      
      }

      let monthDiff = endDateMoment.diff(startDate, 'months');

      if (frequency == 'Quarterly' && monthDiff % 3 !== 0) {
    
        this.dueDateError = 'Contract duration must be in multiples of 3 months for Quarterly frequency.';
      
        this.masterList['nextDueDayList'] = [];
    
        return;
    
      }

      // if (frequency == 'Annually' && monthDiff % 12 !== 0) {
      
      //   this.dueDateError = 'Contract duration must be in multiples of 12 months for Annual frequency.';
    
      //   this.masterList['nextDueDayList'] = [];
    
      //   return;
    
      // }

      // Generate due dates
      let dueDates = [];
  
      let current = moment(start);

      while (current <= endDateMoment) {
    
        dueDates.push({
      
          '_id': current.format('YYYY-MM-DD'),
    
          'dueDate': current.format('DD-MM-YYYY')

        });
  
        current.add(1, 'month');
  
      }

      this.masterList['nextDueDayList'] = dueDates;

      if (dueDates.length > 0) {
    
        this.cd.at(0).patchValue({ 'nextDueDay': dueDates[0]._id });
    
      }

    
    } else {
    
      this.masterList['nextDueDayList'] = [];
    
    }

  }

  tetantMembersAddItem(index? :any) : any {

    this.formSubmitted = true;

    const lastRow = this.tm.at(this.tm.length - 1);

    lastRow.get('memberName').setValidators([Validators.required]);

    lastRow.get('age').setValidators([Validators.required]);

    lastRow.get('gendar').setValidators([Validators.required]);

    lastRow.get('relationship').setValidators([Validators.required]);

    lastRow.get('memberName').updateValueAndValidity();

    lastRow.get('age').updateValueAndValidity();

    lastRow.get('gendar').updateValueAndValidity();

    lastRow.get('relationship').updateValueAndValidity();

    const memberName = lastRow.get('memberName').value;

    const age = lastRow.get('age').value;

    const gendar = lastRow.get('gendar').value;

    const relationship = lastRow.get('relationship').value;

    if (!memberName || !age || !gendar || !relationship) return;

    lastRow.get('memberName').clearValidators();

    lastRow.get('age').clearValidators();

    lastRow.get('gendar').clearValidators();

    lastRow.get('relationship').clearValidators();

    lastRow.get('memberName').updateValueAndValidity();

    lastRow.get('age').updateValueAndValidity();

    lastRow.get('gendar').updateValueAndValidity();

    lastRow.get('relationship').updateValueAndValidity();

    this.tm.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantMembers' }));








    // this.formSubmitted = true;

    // if(this.tm.controls.every((item: any)=>item.valid)) {
      

    // }

  }

  tenantMemberDeleteItem(index : any){

    this.tm.removeAt(index);
        
    if(this.tm.controls.length == 0) this.tm.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantMembers' }));

  }

  tenantIdProofAddItem(index? :any) : any {

    this.formSubmitted = true;

    if(this.tip.controls.every((item: any)=>item.valid)) {

      this.tip.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantIdProof' }));

    }

  }
  
  tenantIdProofDeleteItem(index : any){

    this.tip.removeAt(index);
        
    if(this.tip.controls.length == 0) this.tip.push(this.getFormArrayFormGroup({ 'formArrayName': 'tenantIdProof' }));

  }

  addConfigurationItem(index? :any) : any {

    this.formSubmitted = true;

    const lastRow = this.cdf.at(this.cdf.length - 1);

    lastRow.get('issueCategory').setValidators([Validators.required]);

    lastRow.get('priority').setValidators([Validators.required]);

    lastRow.get('tat').setValidators([Validators.required]);

    lastRow.get('tatType').setValidators([Validators.required]);

    lastRow.get('issueCategory').updateValueAndValidity();

    lastRow.get('priority').updateValueAndValidity();

    lastRow.get('tat').updateValueAndValidity();

    lastRow.get('tatType').updateValueAndValidity();

    const issueCategory = lastRow.get('issueCategory').value;

    const priority = lastRow.get('priority').value;

    const tat = lastRow.get('tat').value;

    const tatType = lastRow.get('tatType').value;

    if (!issueCategory || !priority || !tat || !tatType) return;

    lastRow.get('issueCategory').clearValidators();

    lastRow.get('priority').clearValidators();

    lastRow.get('tat').clearValidators();

    lastRow.get('tatType').clearValidators();

    lastRow.get('issueCategory').updateValueAndValidity();

    lastRow.get('priority').updateValueAndValidity();

    lastRow.get('tat').updateValueAndValidity();

    lastRow.get('tatType').updateValueAndValidity();

    this.cdf.push(this.getFormArrayFormGroup({ 'formArrayName': 'issueConfiguration' }));

    // this.formSubmitted = true;

    // if(this.cdf.controls.every((item: any)=>item.valid)) {

    //   this.cdf.push(this.getFormArrayFormGroup({ 'formArrayName': 'issueConfiguration' }));

    // }

  }

  deleteConfigurationItem(index : any){

    this.cdf.removeAt(index);

    if(this.cdf.controls.length == 0) this.cdf.push(this.getFormArrayFormGroup({ 'formArrayName': 'issueConfiguration' }));
        
  }

  openPdcModal(): void {

    this.initializePdcForm();
    
    this.modalService.open(this.pdcModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
  
  }

  openPreview(url: string): void {

    this.isPdfPreview = this.isPdf(url);

    if (this.isPdfPreview) {

      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    } else {

      this.previewUrl = url;

    }

  }

  isPdf(url: string): boolean {

    return url?.toLowerCase().endsWith('.pdf');

  }

  closePreview(): void {
    
    this.previewUrl = null;
    
    this.isPdfPreview = false;

  }

  getFileType(fileName: string): 'pdf' | 'word' | 'image' {

    let ext = fileName.split('.').pop()?.toLowerCase();

    if (ext == 'pdf') return 'pdf';

    if (ext == 'doc' || ext == 'docx') return 'word';

    return 'image';

  }

  onFileSelect(event: Event) {

    let input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach((file) => {

      let uploadFile: UploadFile = {

        file,

        preview: URL.createObjectURL(file),

        progress: 0,

        status: 'Uploading',

      };

      this.regularDocumentFiles.push(uploadFile);

      this.regularDocuments.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }

  uploadImage(uploadFile: UploadFile) {

    let interval = setInterval(() => {

      if (uploadFile.progress >= 100) {

        uploadFile.status = 'Completed';

        clearInterval(interval);

      } else {

        uploadFile.progress += 10;

      }

    }, 300);

  }

  removeImage(index: number) {

    this.regularDocumentFiles.splice(index, 1);

    this.regularDocuments.removeAt(index);

  }
  
  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.isDragOver = true;
    
  }

  onDragLeave(event: DragEvent) {

    event.preventDefault();

    this.isDragOver = false;

  }

  onDrop(event: DragEvent, type ?: String) {

    event.preventDefault();
    
    this.isDragOver = false;

    if (event.dataTransfer?.files) {

      let files = Array.from(event.dataTransfer.files);

      this.processFiles(files,type);

    }

  }

  processFiles(files: File[], type ?: String) {

    for (let file of files) {

      type == 'contract'  ? this.onPdfSelect({ target: { files: [file] } } as any) : this.onFileSelect({ target: { files: [file] } } as any); // Call onFileSelect to add to FormArray

    }

  }

  onPdfSelect(event: Event) {

    let input = event.target as HTMLInputElement;

    if (!input.files) return;
  
    Array.from(input.files).forEach((file) => {

      // let allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      // if (!allowedTypes.includes(file.type)) {

      //   alert('Only PDF, JPG, JPEG, and PNG files are allowed.');

      //   return;

      // }
  
      let uploadFile: UploadFile = {

        file,

        preview: file.type == 'application/pdf' ? file.name : URL.createObjectURL(file),

        progress: 0,

        status: 'Uploading',
        
      };

      this.contractFiles.push(uploadFile);

      this.contractDocuments.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }

  savePDC(modal: any): void {

    if (this.pdcForm.invalid) {

      this.pdcForm.markAllAsTouched();

      return;

    }

    let pdcData = this.pdcForm.value;

    if (this.editPdcIndex !== undefined && this.editPdcIndex !== null) {

      this.pdcs.at(this.editPdcIndex).patchValue(pdcData);

      this.masterList['pdcList'][this.editPdcIndex] = pdcData;

      this.editPdcIndex = null;

    } else {

      this.pdcs.push(this.fb.group(pdcData));

      if (!this.masterList['pdcList']) {
      
        this.masterList['pdcList'] = [];
      
      }
      
      this.masterList['pdcList'].push(pdcData);
  
    }
  
    modal.close();
  
    this.pdcForm.reset();

  }

  editPDC(index: number): void {

    let pdcData = this.masterList['pdcList'][index];
    
    this.pdcForm.patchValue(pdcData);
    
    this.editPdcIndex = index;
    
    this.modalService.open(this.pdcModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });
  
  }

  copyPDC(index: number): void {
  
    let copied = _.cloneDeep(this.masterList.pdcList[index]);
  
    this.pdcs.push(this.fb.group(copied));
  
    this.masterList['pdcList'].push(copied);
  
  }

  uploadDocument(uploadFile: UploadFile) {

    let interval = setInterval(() => {

      if (uploadFile.progress >= 100) {

        uploadFile.status = 'Completed';

        clearInterval(interval);

      } else {

        uploadFile.progress += 10;

      }

    }, 300);
    
  }
  
  removeContractFile(index: number) {

    this.contractFiles.splice(index, 1);

    this.contractDocuments.removeAt(index);

  }

  // Required Document Sharing
  shareImage() {

    const selectedFiles = this.regularDocumentFiles;

    if (!selectedFiles || selectedFiles.length == 0) {

      alert('Please upload images to share.');

      return;

    }

    const filePromises = selectedFiles.map((fileObj: { preview: string | URL | Request; file: { name: string; }; }) => fetch(fileObj.preview).then(res => res.blob()).then(blob => new File([blob], fileObj.file.name, { type: blob.type })));

    Promise.all(filePromises).then(files => {

      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {

        navigator.share({ title: 'Property Images', text: 'Check out these property images!', files: files, }).then(() => {

          console.log('Shared successfully');

        }).catch((error) => {

          console.error('Sharing failed', error);

        });

      } else {

        alert('Web Share API is not supported for multiple files on this browser. Please try a supported mobile browser.');

      }

    }).catch(err => {

      console.error('Error preparing files for sharing:', err);

    });

  }

  // Contract detail Document Sharing
  shareDocument() {

    const selectedFiles = this.contractFiles;

    if (!selectedFiles || selectedFiles.length == 0) {

      alert('Please upload images to share.');

      return;

    }

    const filePromises = selectedFiles.map((fileObj) => fetch(fileObj.preview).then(res => res.blob()).then(blob => new File([blob], fileObj.file.name, { type: blob.type })));

    Promise.all(filePromises).then(files => {

      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {

        navigator.share({ title: 'Property Images', text: 'Check out these property images!', files: files, }).then(() => {

          console.log('Shared successfully');

        }).catch((error) => {

          console.error('Sharing failed', error);

        });

      } else {

        alert('Web Share API is not supported for multiple files on this browser. Please try a supported mobile browser.');

      }

    }).catch(err => {

      console.error('Error preparing files for sharing:', err);

    });

  }

  submit(){
  
    this.formSubmitted = true;
  
    this.onContractDateChange(); 

    if (this.dueDateError) return;

    if(this.tenantForm.invalid) return;
  
    let payload = this.tenantForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['contractDetails.$[].contractStartDate', 'contractDetails.$[].contractEndDate', 'pdcList.$[].rentDate', 'pdcList.$[].chequeDate' ]});

    let formData = new FormData();

    Object.keys(this.tenantForm.controls).forEach((key) => {

      if (key == 'regularDocument') {

        this.tenantForm.value.regularDocument.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('regularDocument', item);

          }

        });

      } else if (key == 'contractDocuments') {

        this.tenantForm.value.contractDocuments.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('contractDocuments', item);

          }

        });

      }
      
    });

    if (Array.isArray(payload.issueConfiguration)) {

      payload.issueConfiguration = payload.issueConfiguration.map((config: any) =>
      
        _.omit(config, ['staffList'])
      
      );
    
    }

    formData.append('data', JSON.stringify(payload));
    
    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent : false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result' : _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/otherUser/create', payload: formData }) : 
        
          this.service.patchService({ 'url': `/otherUser/${this.editData?._id}`, payload: formData })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/tenant' });

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })

  }

  closeContract() {

    let payload = this.tenantForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }

    this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['contractDetails.$[].contractStartDate', 'contractDetails.$[].contractEndDate']});

    payload.contractDetails = payload.contractDetails.map((contract: any) => ({ ...contract, 'status': 'closed' }));

    // payload = { ...payload, ...payload.contractDetails: 'staus': 'closed' };
    
    let formData = new FormData();

    Object.keys(this.tenantForm.controls).forEach((key) => {

      if (key == 'regularDocument') {

        this.tenantForm.value.regularDocument.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('regularDocument', item);

          }

        });

      } else if (key == 'contractDocuments') {

        this.tenantForm.value.contractDocuments.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('contractDocuments', item);

          }

        });

      }
      
    });

    if (Array.isArray(payload.issueConfiguration)) {

      payload.issueConfiguration = payload.issueConfiguration.map((config: any) =>
      
        _.omit(config, ['staffList'])
      
      );
    
    }

    formData.append('data', JSON.stringify(payload));

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to Close this Contract",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){
        
        this.service.patchService({ url: `/otherUser/${this.editData?._id}`, payload: formData }).subscribe((res: any) => {

          if (res.status == 'ok') {
            
            this.service.showToastr({ "data": { "message": `Contract Closed Successfully`, "type": "success" } });

            this.editData = _.first(res.data) || {};

            this.loadForm();

          }

        });

      }

    })

  }
  
  openHistoryModal(data?: any) {

    this.selectedData = data;

    this.modalService.open(this.detailHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

  openRentApproveModal(data?: any) {

    this.selectedData = data;

    this.modalRef = this.modalService.open(this.rentApproveModal, { centered: true, size: 'md', backdrop: 'static', keyboard: false });
    
  }

  approveRent(data?: any) {

    let updatedPaymentEntries = data?.paymentEntries?.map((entry: any) => ({ ...entry, isApproved: true }));

    let payload: any = { ...data, isApproved: true, paymentEntries: updatedPaymentEntries };

    this.service.patchService({ url: `/payment/rental/${payload?._id}`, payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.service.showToastr({ "data": { "message": `Approved Successfully`, "type": "success" } });

        this.service.navigate({ 'url': 'app/tenant' });

        this.modalRef.close();

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

}
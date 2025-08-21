import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'Uploading' | 'Completed'| 'Ready to upload';
}

@Component({
  selector: 'app-create-unit',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-unit.component.html',
  styleUrl: './create-unit.component.scss'
})
export class CreateUnitComponent {

  @ViewChild('detailHistoryModal') detailHistoryModal!: TemplateRef<any>;

 constructor(private fb: FormBuilder,public service: CommonService, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService,private sanitizer: DomSanitizer, private modalService: NgbModal) { } 
 
  unitForm: FormGroup = new FormGroup({});
  previewUrl: SafeResourceUrl | null = null;
  isPdfPreview: boolean = false;
  isDragOver : Boolean = false;
  propertyTax: FormGroup = new FormGroup({});
  editData:any = {};
  userDetails: any = {};
  formSubmitted : Boolean = false;
  contractFiles: UploadFile[] = [];
  _: any = _;
  uploadFiles: UploadFile[] = [];
  masterList: any = {};
  permissions: any = {};
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  mode: string = "Create";
  queryParamsValue: any = {};
  totalUtilityAmount: number = 0;
  selectedData: any = [];
  filteredUtilityBill: any[] = [];
  filteredPropertyTypeList: any[] = [];

  tatList : any = [
    { name: '12hours' },
    { name: '1days' },
    { name: '2days' },
    { name: '3days' }
  ]

  furnishingList : any = [
    { id: 1, name: 'Furnished' },
    { id: 1, name: 'Semi Furnished' },
    { id: 1, name: 'Unfurnished' }
  ]

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      
      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url': '/unit/list', payload: {"_id": this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.find(res.data, { _id: this.queryParamsValue }) || {};

            this.loadForm();

          }

        })

      } else {

        this.mode=='Create'

        this.loadForm();
        
      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ['Units'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                    
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

  }

  isSelected(id: string, controlName: string): boolean {

    const selected = this.unitForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  getAllDetails() {

    if(_.size(this.masterList['companyList'])>1) {
          
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'property': this.service.postService({ 

        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
        'loaderState': true

      }),

      'propertyType': this.service.postService({ 

        "url": "/master/propertyType/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'manager': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager', is_active: true },
        
        'loaderState': true

      }),

      'staff': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff', is_active: true },
        
        'loaderState': true

      }),

      'issue': this.service.postService({ 

        "url": "/master/issue/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'utility': this.service.postService({ 

        "url": "/master/utility/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'contractList': this.service.postService({ 

        "url": "/getContract", 
        
        payload: { 'unitId': this.queryParamsValue },
        
        'loaderState': true

      }),

      'propertyTax': this.service.postService({ 

        "url": "/payment/propertyTax/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true  },
        
        'loaderState': true

      }),

      'utilityBill': this.service.postService({ 

        "url": "/utility-bill/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'is_active': true },
        
        'loaderState': true

      }),

    }).subscribe({
    
      next: (res: any) => {

        if(res.propertyType?.status == 'ok') this.masterList['propertyTypeList'] = res.propertyType.data;
        
        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;
        
        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;
        
        if(res.utility?.status == 'ok') this.masterList['utilityList'] = res.utility.data;

        if(res.contractList?.status == 'ok') this.masterList['contractList'] = res.contractList.data;

        if (res.property?.status == 'ok') {

          if (this.userDetails.userType == 'manager' || this.userDetails.userType == 'owner') {

            const allowedPropertyIds = _.map(this.userDetails.propertyIds);

            this.masterList['propertyList'] = _.filter(res.property.data, (property: any) =>

              _.includes(allowedPropertyIds, property._id)

            );

          } else {

            this.masterList['propertyList'] = res.property.data;

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

        if(res.propertyTax?.status == 'ok') {

          this.masterList['propertyTaxList'] = _.filter(res.propertyTax?.data, (tax: any) => {

            return tax.unit?._id == this.editData._id;

          }) || [];
        
        }

        if(res.utilityBill?.status == 'ok') {

          this.filteredUtilityBill = _.filter(res.utilityBill.data, (bill: any) => {
  
            return _.toString(_.get(bill, 'unit._id')) == _.toString(this.queryParamsValue);
  
          });

        };

        if (this.mode == 'Update') {

          this.changeValue({ fieldName: 'propertyName' });

        }

      }

    });
    
  }

  loadForm() {

    this.formSubmitted = false;

    this.unitForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'propertyName': [ this.editData.propertyName?._id || null, Validators.required ],

      'unitName': [ this.editData.unitName || '', Validators.required ],
      
      'countOfBedrooms': [ this.editData.countOfBedrooms || '', Validators.required ],
      
      'furnishing': [ this.editData.furnishing || null, Validators.required ],

      'propertyType': [ this.editData.propertyType?._id || null, Validators.required ],

      'rentalAmt': [ this.editData.rentalAmt || '' ],

      'depositAmt': [ this.editData.depositAmt || '' ],

      'unitImages': this.fb.array([]),
      
      'contractDetailDocuments': this.fb.array([]),
      
      'furnitureIncluded': this.fb.array([]),
      
      'issueConfiguration': this.fb.array([]),
      
      // 'utilities': this.fb.array([]),
      
      // 'propertyTax': this.fb.group({

      //   'propertyTaxAmt': [ this.editData.propertyTax?.propertyTaxAmt || '', Validators.required ],

      //   'dueDate': [ this.editData.propertyTax?.dueDate || '', Validators.required ],

      //   'remindBefore': [ this.editData.propertyTax?.remindBefore || '' ],

      // })

    });

    if (this.mode == 'Create') {
      
      this.fif.push(this.getFurnitureIncludedForm({}));

      this.cdf.push(this.getConfigurationForm({}));
      
      // this.utf.push(this.getUtilityForm({}));
    
    }

    if(this.mode == 'Update') {
  
    this.cdf.clear();
    
    _.forEach(this.editData?.issueConfiguration,(issueDet: any, index: number) => { 
    
      this.cdf.push(this.getConfigurationForm({ config: issueDet }));

    });

    _.forEach(this.editData?.furnitureIncluded,(items: any, index: number) => { 
    
      this.fif.push(this.getFurnitureIncludedForm({ item: items }));

    });

    // this.changeValue({fieldName: 'propertyName'});

    // _.forEach(this.editData?.utilities,(utilities: any, index: number) => { 
    
    //   this.utf.push(this.getUtilityForm({ utility: utilities }));

    // });

    if (this.editData.unitImages?.length) {

      this.editData.unitImages.forEach((imageObj: any) => {

        const fullImageUrl = this.service.getFullImagePath({ imgUrl: imageObj.path });

        const preloadFile: UploadFile = {

          file: { name: imageObj.name } as File,

          preview: fullImageUrl,

          progress: 100,

          status: 'Completed',

        };
    
        this.uploadFiles.push(preloadFile);        

        this.unitImages.push(this.fb.control(imageObj.path));

      });

    }

    if (this.editData.contractDetailDocuments?.length) {

      this.editData.contractDetailDocuments.forEach((imageObj: any) => {

        const fullImageUrl = this.service.getFullImagePath({ imgUrl: imageObj.path });

        const preloadFile: UploadFile = {

          file: { name: imageObj.name } as File,

          preview: fullImageUrl,

          progress: 100,

          status: 'Completed',

        };
    
        this.contractFiles.push(preloadFile);        

        this.contractDetailDocuments.push(this.fb.control(imageObj.path));

      });

    }

    }

    // this.utf.valueChanges.subscribe(() => {
      
    //   this.calculateTotalUtilityAmount();
    
    // });
  
  }

  get f(): any { return this.unitForm.controls; }

  get fif(): any {  return (<FormArray>this.unitForm.controls["furnitureIncluded"]) } 

  get cdf(): any { return (<FormArray>this.unitForm.controls["issueConfiguration"]) };

  // get utf(): any { return (<FormArray>this.unitForm.controls["utilities"]) };

  get contractDetailDocuments(): FormArray { return this.unitForm.get('contractDetailDocuments') as FormArray }

  get unitImages(): FormArray {return this.unitForm.get('unitImages') as FormArray}
  
  getFurnitureIncludedForm({ item = {}} : { item?: any }) : FormGroup {

    return this.fb.group({

      'item': [ item?.item || '' ],

      'count': [ item?.count || '' ],

      'condition': [ item?.condition || '' ],

      'usage': [ item?.usage || '' ],

    });

  }

  getFileType(fileName: string): 'pdf' | 'word' | 'image' {

    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext == 'pdf') return 'pdf';

    if (ext == 'doc' || ext == 'docx') return 'word';

    return 'image';

  }

  getConfigurationForm({ config = {} } : { config?: any }) : FormGroup {

    return this.fb.group({
      
      'issueCategory': [ config?.issueCategory?._id || null ],
      
      'priority': [ config?.priority || null ],
      
      'tat': [ config?.tat || '' ],

      "tatType": [ config?.tatType || null ],
      
      'staff': [ _.map(config.staff,'_id') || '' ],
      
      'manager': [ _.map(config.manager,'_id') || null ],

      'staffList': [ config?.staffList || [] ],
    
    });
  
  }
  
  // getUtilityForm({ utility = {} } : { utility?: any }) : FormGroup {

  //   return this.fb.group({
     
  //     'utilityName': [ utility?.utilityName?._id || '',  ],
     
  //     'utilityType': [ utility?.utilityType || '',  ],
     
  //     'paidBy': [ utility?.paidBy || '', ],

  //     "amount": [ utility?.amount || '',  ],
    
  //   });
  
  // }

  // calculateTotalUtilityAmount(): void {

  //   this.totalUtilityAmount = _.sumBy(this.utf.controls, (group: FormGroup) => {
    
  //     return parseFloat(group.get('amount')?.value) || 0;
    
  //   });
  
  // }

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

      const files = Array.from(event.dataTransfer.files);

      this.processFiles(files,type);

    }

  }

  processFiles(files: File[], type ?: String) {

    for (const file of files) {

      type == 'contract'  ? this.onPdfSelect({ target: { files: [file] } } as any) :   this.onFileSelect({ target: { files: [file] } } as any); // Call onFileSelect to add to FormArray

    }

  }

  openHistoryModal(data?: any) {

    this.selectedData = data;

    this.modalService.open(this.detailHistoryModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

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

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }):any {

    if (fieldName == 'propertyName') {

      const selectedPropertyId = this.unitForm.get('propertyName')?.value;

      const selectedProperty = _.find(this.masterList['propertyList'], { _id: selectedPropertyId });

      if (selectedProperty && selectedProperty.propertyType) {

        const propertyTypeIds = _.map(selectedProperty.propertyType, '_id');

        this.filteredPropertyTypeList = _.filter(this.masterList['propertyTypeList'], (type: any) =>

          _.includes(propertyTypeIds, type._id)

        );

      } else {

        this.filteredPropertyTypeList = [];

      }

      const currentPropertyType = this.unitForm.get('propertyType')?.value;

      if (currentPropertyType && !_.find(this.filteredPropertyTypeList, { _id: currentPropertyType })) {

        this.unitForm.get('propertyType')?.reset();

      }

    }

    if (fieldName == 'issueCategory') {

      let rowValue = this.cdf.at(index).value

      let issue = _.find(this.masterList['issueList'],{'_id': rowValue?.issueCategory });

      let staff = _.filter(this.masterList['staffList'], (e: any) =>

        Array.isArray(e.issues) &&

        _.some(e.issues, (i: any) => i._id == rowValue?.issueCategory)

      );
      
      this.cdf.at(index).patchValue({

        'priority': issue.priority,

        'tat': issue.tat,

        'tatType': issue.tatType,

        'staffList': staff,

        // 'manager': issue.manager?._id,

      })

    }

  }

  addFurnitureItem(index? :any) : any {

    this.formSubmitted = true;

    const lastRow = this.fif.at(this.fif.length - 1);

    lastRow.get('item').setValidators([Validators.required]);

    lastRow.get('count').setValidators([Validators.required]);

    lastRow.get('condition').setValidators([Validators.required]);

    lastRow.get('usage').setValidators([Validators.required]);

    lastRow.get('item').updateValueAndValidity();

    lastRow.get('count').updateValueAndValidity();

    lastRow.get('condition').updateValueAndValidity();

    lastRow.get('usage').updateValueAndValidity();

    const item = lastRow.get('item').value;

    const count = lastRow.get('count').value;

    const condition = lastRow.get('condition').value;

    const usage = lastRow.get('usage').value;

    if (!item || !count || !condition || !usage) return;
    
    lastRow.get('item').clearValidators();

    lastRow.get('count').clearValidators();

    lastRow.get('condition').clearValidators();

    lastRow.get('usage').clearValidators();

    lastRow.get('item').updateValueAndValidity();

    lastRow.get('count').updateValueAndValidity();

    lastRow.get('condition').updateValueAndValidity();

    lastRow.get('usage').updateValueAndValidity();

    this.fif.push(this.getFurnitureIncludedForm({}));  

  }

  deleteFurnitureItem(index : any){

    this.fif.removeAt(index);
        
    if(this.fif.controls.length == 0) this.fif.push(this.getFurnitureIncludedForm({}));

  }

  addConfigurationItem(index: number) {

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

    if (!issueCategory || !priority || !tat || !tatType) {
      // Do not show toast, just let the form show validation errors
      return;
    }

    lastRow.get('issueCategory').clearValidators();

    lastRow.get('priority').clearValidators();

    lastRow.get('tat').clearValidators();

    lastRow.get('tatType').clearValidators();

    lastRow.get('issueCategory').updateValueAndValidity();

    lastRow.get('priority').updateValueAndValidity();

    lastRow.get('tat').updateValueAndValidity();

    lastRow.get('tatType').updateValueAndValidity();

    this.cdf.push(this.getConfigurationForm({}));

  }

  // addConfigurationItem(index? :any) : any {

  //   this.formSubmitted = true;

  //   if(this.cdf.controls.every((item: any)=>item.valid)) {

  //     this.cdf.push(this.getConfigurationForm({}));  

  //   }

  // }

  deleteConfigurationItem(index : any){

    this.cdf.removeAt(index);
        
    if(this.cdf.controls.length == 0) this.cdf.push(this.getConfigurationForm({}));

  }

  // addUtilityItem(index? :any) : any {

  //   this.formSubmitted = true;

  //   if(this.utf.controls.every((item: any)=>item.valid)) {

  //     this.utf.push(this.getUtilityForm({}));  

  //   }

  // }

  // deleteUtilityItem(index : any){

  //   this.utf.removeAt(index);
        
  //   if(this.utf.controls.length == 0) this.utf.push(this.getUtilityForm({}));

  // }

  onPdfSelect(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files) return;
  
    Array.from(input.files).forEach((file) => {

      // const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      // if (!allowedTypes.includes(file.type)) {

      //   alert('Only PDF, JPG, JPEG, and PNG files are allowed.');

      //   return;

      // }
  
      const uploadFile: UploadFile = {

        file,

        preview: file.type == 'application/pdf' ? file.name : URL.createObjectURL(file),

        progress: 0,

        status: 'Uploading',
        
      };

      this.contractFiles.push(uploadFile);

      this.contractDetailDocuments.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }
  
  close(){

    this.service.navigate({ 'url': 'app/units' });
    
  }

  onFileSelect(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach((file) => {

      const uploadFile: UploadFile = {

        file,

        preview: URL.createObjectURL(file),

        progress: 0,

        status: 'Uploading',

      };

      this.uploadFiles.push(uploadFile);

      this.unitImages.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }

  removeImage(index: number) {

    this.uploadFiles.splice(index, 1);

    this.unitImages.removeAt(index);

  }
  
  uploadImage(uploadFile: UploadFile) {

    const interval = setInterval(() => {

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

    this.contractDetailDocuments.removeAt(index);

  }

  // Images & Documents Sharing
  shareImage() {

    const selectedFiles = this.uploadFiles;

    if (!selectedFiles || selectedFiles.length == 0) {

      alert('Please upload images to share.');

      return;

    }

    const filePromises = selectedFiles.map(fileObj => fetch(fileObj.preview).then(res => res.blob()).then(blob => new File([blob], fileObj.file.name, { type: blob.type })));

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

  // Images & Documents Sharing
  shareContractDocuments() {

    const selectedFiles = this.contractFiles;

    if (!selectedFiles || selectedFiles.length == 0) {

      alert('Please upload images to share.');

      return;

    }

    const filePromises = selectedFiles.map(fileObj => fetch(fileObj.preview).then(res => res.blob()).then(blob => new File([blob], fileObj.file.name, { type: blob.type })));

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

  onSubmit() {

    this.formSubmitted = true;

    let payload = this.unitForm.getRawValue();    
    
    // this.service.changePayloadDateFormat({ 'data':payload, 'fields': ['propertyTax.dueDate']});

    // payload['issueConfiguration'] = _.filter(this.unitForm.value.issueConfiguration, (item: any) => item.issueCategory != null);    
    
    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }    

    if(this.unitForm.invalid) return;
    
    const formData = new FormData();

    // Object.keys(this.unitForm.controls).forEach((key) => {

    //   if (key == 'unitImages') {

    //     this.unitForm.value.unitImages.forEach((file: File) => {

    //       formData.append('unitImages', file);

    //     });

    //   } else {

    //     // formData.append(key, this.unitForm.get(key)?.value);

    //   }

    // });
    
    Object.keys(this.unitForm.controls).forEach((key) => {

      if (key == 'unitImages') {

        this.unitForm.value.unitImages.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('unitImages', item);

          }

        });

      } else if (key == 'contractDetailDocuments') {

        this.unitForm.value.contractDetailDocuments.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('contractDetailDocuments', item);

          }

        });

      }
      
    });

    formData.append('data', JSON.stringify(payload));

    this.confirmationDialog?.confirm({

      title: "Are you sure ?",

      message: "Do you want to save your changes before exiting ?",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result': _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/unit/create', payload : formData  }) : 
        
          this.service.patchService({ 'url': `/unit/${this.editData?._id}`, payload : formData })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/units' });

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })

  }

  openUtilityAmtModal(data?: any){

    this.service.navigate({ 'url': 'app/payment/utility/pay-utility', queryParams: { id: data }  }); 
        
  }

  getStatus(item: any): string {

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

}

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'Uploading' | 'Completed';
}

@Component({
  selector: 'app-create-staff',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-staff.component.html',
  styleUrl: './create-staff.component.scss'
})
export class CreateStaffComponent {

constructor(private fb: FormBuilder,public service: CommonService, private confirmationDialog: ConfirmationDialogService,private route: ActivatedRoute,private sanitizer: DomSanitizer) { } 
   
  staffForm: FormGroup = new FormGroup({});
  editData:any = {};
  isDragOver : Boolean = false;
  isPdfPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  _: any = _;
  userDetails: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {}
  mode: string = "Create";
  queryParamsValue: any = {};
  contractFiles: UploadFile[] = [];
  uploadFiles: UploadFile[] = [];

  companyId: any = {};
  branchId: any = {}
  branchList: any = {}

  permissions: any = {};

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url' : '/otherUser/list', payload: {'parentCompanyId' : this.userDetails.parentCompanyId, "_id": this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

            this.loadForm();

          } 
          
        })

      } else {

        this.mode=='Create'

        this.loadForm();
        
      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Owner"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
              
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getAllDetails();
    
    this.loadForm();

    if(this.mode == 'Update'){ 

      this.getPropertyLevelIssueList();

      this.getUnitLevelIssueList();

      this.getTenantLevelIssueList();

    }

  }

  getAllDetails(){

    forkJoin({

    'countryIdList': this.service.getService({ "url": "/countries" }),

    'rolesList': this.service.postService({'url': '/master/roles/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId } }),

    'property': this.service.postService({ 

      "url": "/property/list", 
      
      payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
      
      'loaderState': true

    }),

    'issue': this.service.postService({ 

      "url": "/master/issue/list", 
      
      payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
      
      'loaderState': true

    }),

    'manager': this.service.postService({ 

      "url": "/otherUser/list", 
      
      payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager', is_active: true },
      
      'loaderState': true

    }),

    }).subscribe({

      next: (res: any) => {

        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || [];

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];

        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;
        
        if(res.property?.status == 'ok') this.masterList['propertyList'] = res.property.data;

        if(res.manager?.status == 'ok') this.masterList['issueManagerList'] = res.manager.data;

      }

    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.staffForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'firstName': [ this.editData?.firstName || '', [Validators.required] ],
      
      'lastName': [ this.editData?.lastName || '', [Validators.required] ],
      
      'mobileNo': [ this.editData?.mobileNo || '', [Validators.required, Validators.pattern('^[0-9]{10}$')] ],
      
      'email': [ this.editData?.email || '', [Validators.required, Validators.email] ],
      
      'addressLineOne': [ this.editData?.addressLineOne || '', [Validators.required] ],
      
      'addressLineTwo': [ this.editData?.addressLineTwo || '' ],
      
      'countryId': [ this.editData?.countryId?._id || null, [Validators.required] ],
      
      'state': [ this.editData?.state || '', [Validators.required] ],
      
      'city': [ this.editData?.city || '', [Validators.required] ],
      
      'pincode': [ this.editData?.pincode || '',[Validators.required]],
      
      'propertyName': [ _.map(this.editData.propertyName,'_id') || '',  [Validators.required] ],
      
      'manager': [ _.map(this.editData.manager,'_id') || '',  [Validators.required] ],
      
      'issues': [ _.map(this.editData.issues,'_id') || '',  [Validators.required] ],
      
      'role': [ this.editData?.role?._id || null , [Validators.required] ],
      
      'userType': [ this.editData.userType || 'staff' ],

      'referenceDocs': this.fb.array([]),
      
      'propertyLevelIssue': this.fb.array([]),
      
      'unitLevelIssue': this.fb.array([]),

      'tenantLevelIssue': this.fb.array([]),

    });

    
    if(this.mode == 'Update'){

      this.pif.push(this.getPropertyLevelIssueForm({}));

      this.uif.push(this.getUnitLevelIssueForm({}));

      this.tif.push(this.getTenantLevelIssueForm({}));

    }

    if (this.mode == 'Update') {
      
      this.masterList['managerList'] = this.editData.manager;

      _.forEach(this.editData?.propertyLevelIssue,(propertyLevelIssue: any, index: number) => { 
                
        this.pif.push(this.getPropertyLevelIssueForm({ property: propertyLevelIssue }));

      });

      _.forEach(this.editData?.unitLevelIssue,(unitLevelIssue: any, index: number) => { 
            
        this.uif.push(this.getUnitLevelIssueForm({ unit: unitLevelIssue }));

      });

      _.forEach(this.editData?.tenantLevelIssue,(tenantLevelIssue: any, index: number) => { 
            
        this.tif.push(this.getTenantLevelIssueForm({ tenant: tenantLevelIssue }));

      });
    
    }

    if (this.editData.referenceDocs?.length) {

      this.editData.referenceDocs.forEach((imageObj: any) => {

        let fullImageUrl = this.service.getFullImagePath({ imgUrl: imageObj.path });

        let preloadFile: UploadFile = {

          file: { name: imageObj.name } as File,

          preview: fullImageUrl,

          progress: 100,

          status: 'Completed',

        };
    
        this.uploadFiles.push(preloadFile);

        this.referenceDocs.push(this.fb.control(imageObj.path));

      });

    }
  
  }

  get f(): any { return this.staffForm.controls; }

  get contractDetailDocuments(): FormArray { return this.staffForm.get('regularDocument') as FormArray }

  get referenceDocs(): FormArray {return this.staffForm.get('referenceDocs') as FormArray}

  get pif(): any { return (<FormArray>this.staffForm.controls["propertyLevelIssue"]) };

  get uif(): any { return (<FormArray>this.staffForm.controls["unitLevelIssue"]) };

  get tif(): any { return (<FormArray>this.staffForm.controls["tenantLevelIssue"]) };

  getPropertyLevelIssueForm({ property = {} } : { property?: any }) : FormGroup {

    return this.fb.group({
      
      'propertyName': [ property?.propertyName?._id || null ],
      
      'issueCategory': [ property?.issueCategory?._id || null ],
      
      'priority': [ property?.priority || null ],
      
      'tat': [ property?.tat || '' ],

      "tatType": [ property?.tatType || null ],

      'manager': [ _.map(property.manager,'_id') || null ],
      
      // 'staff': [ _.map(property.staff,'_id') || '', ],
      
      // 'staffList': [ property?.staffList || [] ],

      'activeDate': [ property?.activeDate || '' ],

      'inactiveDate': [ property?.inactiveDate || '' ]
    
    });
  
  }

  getUnitLevelIssueForm({ unit = {} } : { unit?: any }) : FormGroup {

    return this.fb.group({
      
      'propertyName': [ unit.propertyName?._id || null ],

      'unitName': [ unit.unitName?._id || null ],
      
      'issueCategory': [ unit?.issueCategory?._id || null ],
      
      'priority': [ unit?.priority || null ],
      
      'tat': [ unit?.tat || '', ],

      "tatType": [ unit?.tatType || null ],
      
      'manager': [ _.map(unit?.manager,'_id') || null ],
      
      'activeDate': [ unit?.activeDate || '' ],

      'inactiveDate': [ unit?.inactiveDate || '' ]
    
    });
  
  }

  getTenantLevelIssueForm({ tenant = {} } : { tenant?: any }) : FormGroup {

    return this.fb.group({
      
      'propertyName': [ tenant?.propertyName?._id || null ],

      'unitName': [ tenant?.unitName?._id || null ],

      'tenantName': [ tenant.tenantName?._id || null ],
      
      'issueCategory': [ tenant?.issueCategory?._id || null ],
      
      'priority': [ tenant?.priority || null ],
      
      'tat': [ tenant?.tat || '', ],

      "tatType": [ tenant?.tatType || null ],
      
      'manager': [ _.map(tenant?.manager,'_id') || null ],
      
      'activeDate': [ tenant?.activeDate || '' ],

      'inactiveDate': [ tenant?.inactiveDate || '' ]
    
    });
  
  }

  changeValue(fieldName? : string , index?: number ){
  
    if (fieldName == 'issueCategory') {

      let rowValue = this.pif.at(index).value

      let issue = _.find(this.masterList['issueList'],{'_id': rowValue?.issueCategory });

      let staff = _.filter(this.masterList['staffList'], (e: any) =>

        Array.isArray(e.issues) &&

        _.some(e.issues, (i: any) => i._id == rowValue?.issueCategory)

      );
      
      this.pif.at(index).patchValue({

        'priority': issue.priority,

        'tat': issue.tat,

        'tatType': issue.tatType,
        
        'staffList': staff,

      })

    }

  }

  getPropertyLevelIssueList() {

    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');
    
    }
  
    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };
  
    this.service.postService({ url: '/property/list', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let filteredData = _.filter(res.data, (e: any) => {

          return _.some(e.issueConfiguration, (o: any) => 
          
            _.some(o.staff, (s: any) => s._id == this.queryParamsValue)
          
          );
        
        });
  
        this.masterList['propertyLevelIssueList'] = filteredData;
  
        if (this.mode == 'Update') {

          this.pif.clear();
        
          _.forEach(filteredData, (property: any) => {
        
            _.forEach(property.issueConfiguration, (config: any) => {
        
              let hasStaff = _.some(config.staff, (m: any) => m._id == this.queryParamsValue);
        
              if (hasStaff) {
        
                let formValue = {
        
                  propertyName: {

                    '_id': property?._id,
                    
                    'propertyName': property?.propertyName
                  
                  },
        
                  'issueCategory': config?.issueCategory || null,
                  
                  'priority': config?.priority || '',
                  
                  'tat': config?.tat || '',
                  
                  'tatType': config?.tatType || '',

                  'manager': config.manager || '',
                  
                  // 'staff': config.staff || '',
                  
                  // 'staffList': config?.staffList || [],
                  
                  'activeDate': config?.activeDate || '',
                  
                  'inactiveDate': config?.inactiveDate || ''
                
                };
        
                this.pif.push(this.getPropertyLevelIssueForm({ property: formValue }));
              }
        
            });
        
          });
        
        }
  
      }

    });
  
  }

  getUnitLevelIssueList() {

    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');
    
    }
  
    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId };
  
    this.service.postService({ url: '/unit/list', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {
  
        let filteredData = _.filter(res.data, (e: any) => {

          return _.some(e.issueConfiguration, (o: any) => 
          
            _.some(o.staff, (s: any) => s._id == this.queryParamsValue)
          
          );
        
        });
  
        this.masterList['unitLevelIssueList'] = _.uniqBy(filteredData, '_id');
  
        if (this.mode == 'Update') {
  
          this.uif.clear();

          _.forEach(filteredData, (unit: any) => {
        
            _.forEach(unit.issueConfiguration, (config: any) => {
        
              let hasStaff = _.some(config.staff, (m: any) => m._id == this.queryParamsValue);
        
              if (hasStaff) {
        
                let formValue = {
        
                  propertyName: {
           
                    '_id': unit?.propertyName?._id,
            
                    'propertyName': unit?.propertyName?.propertyName
            
                  },

                  unitName: {
           
                    '_id': unit?._id,
            
                    'unitName': unit?.unitName
            
                  },
        
                  'issueCategory': config?.issueCategory || null,
                  
                  'priority': config?.priority || '',
                  
                  'tat': config?.tat || '',
                  
                  'tatType': config?.tatType || '',
                  
                  'manager': config.manager || '',
                  
                  'activeDate': config?.activeDate || '',
                  
                  'inactiveDate': config?.inactiveDate || ''
                
                };
        
                this.uif.push(this.getUnitLevelIssueForm({ unit: formValue }));

              }
        
            });
        
          });
  
        }
  
      }

    });
  
  }

  getTenantLevelIssueList() {

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' }
  
    this.service.postService({ url: '/otherUser/list', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {
  
        let filteredData = _.filter(res.data, (e: any) => {

          return _.some(e.issueConfiguration, (o: any) => 
          
            _.some(o.staff, (s: any) => s._id == this.queryParamsValue)
          
          );
        
        });
  
        this.masterList['tenantLevelIssueList'] = _.uniqBy(filteredData, '_id');
  
        if (this.mode == 'Update') {
  
          this.tif.clear();

          _.forEach(filteredData, (tenant: any) => {
        
            _.forEach(tenant.issueConfiguration, (config: any) => {
        
              let hasStaff = _.some(config.staff, (m: any) => m._id == this.queryParamsValue);
        
              if (hasStaff) {
        
                let formValue = {
        
                  'propertyName': {

                    '_id': tenant?.propertyName[0]?._id,
                    
                    'propertyName': tenant?.propertyName[0]?.propertyName
                  
                  },

                  'unitName': tenant.unitName,

                  'tenantName': {

                    '_id': tenant?._id,
                    
                    'firstName': tenant?.firstName,

                    'lastName': tenant?.lastName,
                  
                  },
        
                  'issueCategory': config?.issueCategory || null,
                  
                  'priority': config?.priority || '',
                  
                  'tat': config?.tat || '',
                  
                  'tatType': config?.tatType || '',
                  
                  'manager': config.manager || '',
                  
                  'activeDate': config?.activeDate || '',
                  
                  'inactiveDate': config?.inactiveDate || ''
                
                };
        
                this.tif.push(this.getTenantLevelIssueForm({ tenant: formValue }));

              }
        
            });
        
          });
  
        }
  
      }

    });
  
  }

  onTenantChange(index: number) {

    let tenantId = this.tif.at(index).get('tenantName')?.value;
    
    let selectedTenant = _.find(this.masterList['tenantLevelIssueList'], ['_id', tenantId]);

    if (selectedTenant) {
    
      this.tif.at(index).patchValue({
    
        unitName: selectedTenant.unitName
    
      });
  
    }

  }

  getIssueFormArray(type: 'property' | 'unit' | 'tenant'): FormArray {

    switch (type) {

      case 'property':

        let propertyFormArray = this.staffForm.get('propertyLevelIssue') as FormArray;

        if (!propertyFormArray) return this.fb.array([]);

        return propertyFormArray;

      case 'unit':

        let unitFormArray = this.staffForm.get('unitLevelIssue') as FormArray;

        if (!unitFormArray) return this.fb.array([]);

        return unitFormArray;

      case 'tenant':

        let tenantFormArray = this.staffForm.get('tenantLevelIssue') as FormArray;

        if (!tenantFormArray) return this.fb.array([]);

        return tenantFormArray;

      default: throw new Error(`Invalid type: ${type}`);

    }

  }

  getIssueForm(type: 'property' | 'unit' | 'tenant', config: any = {}): FormGroup {

    switch (type) {

      case 'property': return this.getPropertyLevelIssueForm({ property: config });

      case 'unit': return this.getUnitLevelIssueForm({ unit: config });

      case 'tenant': return this.getTenantLevelIssueForm({ tenant: config });

      default: throw new Error(`Invalid type: ${type}`);

    }

  }

  addIssue(type: 'property' | 'unit' | 'tenant') {

    this.formSubmitted = true;

    let formArray = this.getIssueFormArray(type);
    
    if (!formArray) return;

    if (formArray.length == 0) {

      formArray.push(this.getIssueForm(type, {}));
      
      return;

    }

    let lastRow = formArray.at(formArray.length - 1) as FormGroup;

    let issueCategoryControl = lastRow.get('issueCategory');

    let priorityControl = lastRow.get('priority');

    let tatControl = lastRow.get('tat');

    let tatTypeControl = lastRow.get('tatType');

    if (!issueCategoryControl || !priorityControl || !tatControl || !tatTypeControl) return;

    issueCategoryControl.setValidators([Validators.required]);

    priorityControl.setValidators([Validators.required]);

    tatControl.setValidators([Validators.required]);

    tatTypeControl.setValidators([Validators.required]);

    issueCategoryControl.markAsTouched();

    priorityControl.markAsTouched();

    tatControl.markAsTouched();

    tatTypeControl.markAsTouched();

    issueCategoryControl.updateValueAndValidity();

    priorityControl.updateValueAndValidity();

    tatControl.updateValueAndValidity();

    tatTypeControl.updateValueAndValidity();

    if (issueCategoryControl.invalid || priorityControl.invalid || tatControl.invalid || tatTypeControl.invalid) return;

    issueCategoryControl.clearValidators();

    priorityControl.clearValidators();

    tatControl.clearValidators();

    tatTypeControl.clearValidators();

    issueCategoryControl.updateValueAndValidity();

    priorityControl.updateValueAndValidity();

    tatControl.updateValueAndValidity();

    tatTypeControl.updateValueAndValidity();

    formArray.push(this.getIssueForm(type, {}));

  }

  // addIssue(type: 'property' | 'unit' | 'tenant') {

  //   this.formSubmitted = true;

  //   let formArray = this.getIssueFormArray(type);
    
  //   if (formArray.controls.every((item: any) => item.valid)) {
    
  //     formArray.push(this.getIssueForm(type, {}));
    
  //   }

  // }

  deleteIssue(type: 'property' | 'unit' | 'tenant', index: number) {

    let formArray = this.getIssueFormArray(type);
    
    formArray.removeAt(index);
    
    if (formArray.controls.length == 0) {
    
      formArray.push(this.getIssueForm(type, {}));
    
    }
  
  }

  // getIssueFormArray(type: string): FormArray {
  
  //   switch (type) {
  
  //     case 'property': return this.pif;
  
  //     case 'unit': return this.uif;
  
  //     case 'tenant': return this.tif;
  
  //     default: throw new Error('Invalid issue type');
  
  //   }
  
  // }

  // getIssueForm(type: string, data: any): FormGroup {
  
  //   switch (type) {
  
  //     case 'property': return this.getPropertyLevelIssueForm(data);
  
  //     case 'unit': return this.getUnitLevelIssueForm(data);
  
  //     case 'tenant': return this.getTenantLevelIssueForm(data);
  
  //     default: throw new Error('Invalid issue type');
  
  //   }
  
  // }

  isSelected(id: string, controlName: string): boolean {

    let selected = this.staffForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  getFileType(fileName: string): 'pdf' | 'word' | 'image' {

    let ext = fileName.split('.').pop()?.toLowerCase();

    if (ext == 'pdf') return 'pdf';

    if (ext == 'doc' || ext == 'docx') return 'word';


    return 'image';

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
    
  }

  onPropertyChange() {

    let selectedIssueIds = this.staffForm.get('propertyName')?.value;
    
    let filteredIssueIds = _.compact(selectedIssueIds);
  
    let selectedProperty = _.filter(this.masterList['propertyList'], (item: { _id: any }) =>

      _.includes(filteredIssueIds, item._id)

    );

    let allManagers = _.flatten(selectedProperty.map((item: any) => item.manager));
    
    this.masterList['managerList'] = _.uniqBy(allManagers, '_id');

    this.staffForm.get('manager')?.setValue([]);

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

      this.uploadFiles.push(uploadFile);

      this.referenceDocs.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }

  removeImage(index: number) {

    this.uploadFiles.splice(index, 1);

    this.referenceDocs.removeAt(index);

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

  removeContractFile(index: number) {

    this.contractFiles.splice(index, 1);

    this.contractDetailDocuments.removeAt(index);

  }

  onDragOver(event: DragEvent) {

    event.preventDefault();

    this.isDragOver = true;
    
  }

  onDragLeave(event: DragEvent) {

    event.preventDefault();

    this.isDragOver = false;

  }

  onDrop(event: DragEvent) {

    event.preventDefault();
    
    this.isDragOver = false;

    if (event.dataTransfer?.files) {

      let files = Array.from(event.dataTransfer.files);

      this.processFiles(files);

    }

  }

  processFiles(files: File[]) {

    for (let file of files) {

      this.onFileSelect({ target: { files: [file] } } as any); // Call onFileSelect to add to FormArray

    }

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

  submit(){

    this.formSubmitted = true;

    if(this.staffForm.invalid) return;

    let payload = this.staffForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }    

    if(this.staffForm.invalid) return;
    
    let formData = new FormData();

    Object.keys(this.staffForm.controls).forEach((key) => {

      if (key == 'referenceDocs') {

        this.staffForm.value.referenceDocs.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('referenceDocs', item);

          }

        });

      } else {

        // If needed, handle other fields here
        // formData.append(key, this.propertyForm.get(key)?.value);

      }

    });
    
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

          this.service.postService({ 'url': '/otherUser/create', payload :  formData }) : 
        
          this.service.patchService({ 'url': `/otherUser/${this.editData?._id}`,payload :  formData })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/staff' });

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })

  }

}
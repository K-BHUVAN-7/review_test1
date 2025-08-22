import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import moment from 'moment';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'Uploading' | 'Completed';
}

@Component({
  selector: 'app-add-tenant-issue',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-tenant-issue.component.html',
  styleUrl: './add-tenant-issue.component.scss'
})

export class AddTenantIssueComponent {

 constructor(private fb: FormBuilder,public service: CommonService, private route: ActivatedRoute, private confirmationDialog: ConfirmationDialogService) { } 
  
  tenantIssueForm: FormGroup = new FormGroup({});
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
  filteredUnitList: any[] = [];
  queryParamsValue: any = {};
  mode : string = "Create";
  filteredStaffList: any[] = [];

  isDragOver : Boolean = false;
  isPdfPreview: boolean = false;
  isWordPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
  
      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({ 'url' : '/tickets/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId, "_id" : this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

            // this.loadForm();

          } 

        })

      } else {

        this.mode == 'Create';

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ['Tickets'], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
                    
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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff', is_active: true },
        
        'loaderState': true

      }),

      'manager': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'manager', is_active: true },
        
        'loaderState': true

      }),

      'idProof': this.service.postService({ 

        "url": "/master/idProof/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
  
        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || [];
        
        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];
        
        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];
        
        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;
        
        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;
        
        if(res.manager?.status == 'ok') this.masterList['managerList'] = res.manager.data;
        
        if(res.idProof?.status == 'ok') this.masterList['idProofList'] = res.idProof.data;

        if (this.userDetails?.userType == 'admin') {

          if(res.propertyList?.status == 'ok')  this.masterList['propertyList'] = res.propertyList.data || [];

        } else{

          if(res.propertyList?.status == 'ok')  this.masterList['propertyList'] = _.find(res.propertyList.data,(e) => e._id == _.find(this.masterList['unitList'], (e: any ) => e._id == this.userDetails.unitName)?.propertyName?._id);
          
          if(!_.isEmpty(this.masterList['propertyList'])) {
  
            this.masterList['propertyList'] = [this.masterList['propertyList']] 
  
          } 
          
        }

        this.mode == 'Update' ? this.loadForm() : ''

      }
  
    });

  }

  close(){

    this.service.navigate({ 'url': 'app/tickets/tenant-tickets' });
    
  }

  loadForm() {

    this.formSubmitted = false;

    const edit = this.editData;

    const user = this.userDetails;

    this.tenantIssueForm = this.fb.group({
      
      'parentCompanyId': [this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required],
      
      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],
      
      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],
      
      'propertyName': [ this.editData.propertyName?._id || null, Validators.required ],
      
      'unitName': [ this.editData.unitName?._id || null, Validators.required ],
      
      'issueName': [ this.editData.issueName?._id || null, Validators.required ],
      
      'tat': [ this.editData.tat || '' ],
      
      'tatType': [ this.editData?.tatType || '' ],
      
      'staffName': [ this.editData?.staffName?._id || null ],

      'ticketStatus': [ 'assigned' ],
    
      'issueDescription': [ this.editData.issueDescription || '' ],
    
      'images': this.fb.array([]),

      'issueRaisedDate': [ this.editData?.issueRaisedDate || moment().format('YYYY-MM-DD') ]
    
    });

    if (this.mode == 'Update') {

      this.changeValue('propertyName');

      const selectedIssueId = edit.issueName?._id;
      
      if (selectedIssueId) {
      
        this.issueSelected(selectedIssueId, edit.staffName?._id);
      
      }
    
    }

    this.f.issueName.valueChanges.subscribe((issueId?: string) => {
      
      if (issueId) {
      
        this.issueSelected(issueId);
      
      }
    
    });

    if (this.editData.images?.length) {

      this.editData.images.forEach((imageObj: any) => {
      
        const fullImageUrl = this.service.getFullImagePath({ imgUrl: imageObj.path });

        const preloadFile: UploadFile = {
      
          file: { name: imageObj.name } as File,
      
          preview: fullImageUrl,
      
          progress: 100,
      
          status: 'Completed',
      
        };
      
        this.uploadFiles.push(preloadFile);
      
        this.images.push(this.fb.control(imageObj.path));
      
      });
    
    }

  }

  issueSelected(issueId: string, preselectedStaffId: string = ''): void {

    const issue = _.find(this.masterList['issueList'], { _id: issueId });

    if (!issue) return;

    this.tenantIssueForm.patchValue({
  
      'tat': issue.tat || '',
 
      'tatType': issue.tatType || ''
 
    });

    const filteredStaff = _.filter(this.masterList['staffList'], (staff: any) =>
  
      _.some(staff.issues, { _id: issueId })
  
    );

    this.filteredStaffList = [...filteredStaff];

    let staffToPatch = _.get(filteredStaff, '[0]._id', '');

    if (preselectedStaffId && _.some(filteredStaff, { _id: preselectedStaffId })) {
 
      staffToPatch = preselectedStaffId;
 
    }

    this.tenantIssueForm.patchValue({
 
      'staffName': staffToPatch
 
    });
 
  }

  changeValue(fieldName?: string, index?: number) {

    if (fieldName == 'propertyName') {
      
      const selectedPropertyId = Array.isArray(this.f.propertyName.value) ? this.f.propertyName.value[0] : this.f.propertyName.value;

      this.filteredUnitList = _.filter(this.masterList['unitList'], (unit: any) => {
        
        return unit?.propertyName?._id == selectedPropertyId;
      
      });

      if (this.mode == 'Update' && this.editData?.unitName?._id) {

        const validUnit = _.find(this.filteredUnitList, { _id: this.editData.unitName._id });
        
        this.f.unitName.setValue(validUnit ? validUnit._id : null);
      
      } else {
      
        this.f.unitName.setValue(null);
      
      }
    
    }

  }

  get f(): any { return this.tenantIssueForm.controls; }

  get images(): FormArray {return this.tenantIssueForm.get('images') as FormArray}

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

      this.images.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });

  }

  // Simulate Image Upload Progress
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

  removeImage(index: number) {

    this.uploadFiles.splice(index, 1);

    this.images.removeAt(index);

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

      const files = Array.from(event.dataTransfer.files);

      this.processFiles(files);

    }

  }

  processFiles(files: File[]) {

    for (const file of files) {

      this.onFileSelect({ target: { files: [file] } } as any); // Call onFileSelect to add to FormArray

    }

  }

  getFileType(fileName: string): 'pdf' | 'word' | 'image' {

    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext == 'pdf') return 'pdf';

    if (ext == 'doc' || ext == 'docx') return 'word';

    return 'image';

  }

  openPreview(url: string): void {

    this.previewUrl = url;

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

  onSubmit(){

    this.formSubmitted = true;

    if(this.tenantIssueForm.invalid) return;
  
    let payload = this.tenantIssueForm.getRawValue();

    this.service.changePayloadDateFormat({ "data": payload, 'fields': ['issueRaisedDate']})

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }    
    
    payload['tenantName'] = this.userDetails?.id;

    const formData = new FormData();

    Object.keys(this.tenantIssueForm.controls).forEach((key) => {

      if (key == 'images') {

        this.tenantIssueForm.value.images.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('images', item);

          }

        });

      } else {

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

          this.service.postService({ 'url': '/tickets/create', payload : formData }) : 
        
          this.service.patchService({ 'url': `/tickets/${this.editData?._id}`, payload : formData })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/tickets/tenant-tickets' });

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

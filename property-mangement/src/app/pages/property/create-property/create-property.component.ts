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
  selector: 'app-create-property',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-property.component.html',
  styleUrl: './create-property.component.scss'
})
export class CreatePropertyComponent {

  constructor(private fb: FormBuilder,public service: CommonService, private route: ActivatedRoute,private confirmationDialog: ConfirmationDialogService,private sanitizer: DomSanitizer) { }

  propertyForm: FormGroup = new FormGroup({});
  isDragOver : Boolean = false;
  isPdfPreview: boolean = false;
  isWordPreview: boolean = false;
  previewUrl: SafeResourceUrl | null = null;
  editData: any = {};
  userDetails: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {};
  issuesList: any = {};
  mode: string = "Create";
  permissions: any = {};
  queryParamsValue: any = {};
  selectedOwners: string[] = [];
  selectedManagers: string[] = [];
  _: any = _;

  selectedIssueIds: any[] = [];

  selectedIssues: any[] = [];
  filteredIssueOptions: any[] = [];
  issueConfigurations: any[] = [];

  companyId: any = {};
  branchId: any = {}
  branchList: any = {}

  uploadFiles: UploadFile[] = [];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
  
      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url': '/property/list', payload: {"_id": this.queryParamsValue } }).subscribe((res: any) => {

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

    this.permissions = this.service.getPermissions({ pathArr: ["Property"], isNeedBranchList: true, 'permission': ['create','view','edit','delete']});
        
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []
    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    // if (this.mode == 'Update') {
      
    //   this.getUnitList();
    
    // }

    this.getAllDetails();

    this.loadForm();

  }

  getAllDetails() {

    if(_.size(this.masterList['companyList'])>1) {
          
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'owner': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'owner', is_active: true },
        
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

      'propertyType': this.service.postService({ 

        "url": "/master/propertyType/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'unit': this.service.postService({ 

        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'country': this.service.getService({ 

        "url": "/countries", 
      
        'loaderState': true

      }),
      
    }).subscribe({
    
      next: (res: any) => {

        if(res.staff?.status == 'ok') this.masterList['staffList'] = res.staff.data;
        
        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;
        
        if(res.propertyType?.status == 'ok') this.masterList['propertyTypeList'] = res.propertyType.data;
        
        if(res.country?.status == 'ok') this.masterList['countryList'] = res.country.data;

        if (res.manager?.status == 'ok') {

          if (this.userDetails.userType == 'owner') {

            let owner = _.find(res.owner.data, ['_id', this.userDetails.id]);

            this.masterList['ownerList'] = owner ? [owner] : [];

          } else {

            this.masterList['ownerList'] = res.owner.data;

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
        
        if (res.unit?.status == 'ok') {

          this.masterList['unitList'] = _.filter(res.unit.data, (unit: any) => {
            
            return unit.propertyName?._id == this.queryParamsValue;
          
          });
       
        }

      }
      
    });

  }

  isSelected(id: string, controlName: string): boolean {

    let selected = this.propertyForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  createUnits(data?:any){

    let queryParams = { 
      
      'id': data?._id,
    
    };

    if(!_.isEmpty(queryParams)) {

      this.service.navigate({ 'url': 'app/units/create-units', queryParams });

    } else {

      this.service.navigate({ 'url': 'app/units/create-units' }); 
        
    }
      
  }

  openUnitModal(unitId: string) {
    
    this.service.navigate({ 'url': 'app/units/create-units', queryParams: { id: unitId } });
  
  }

  loadForm() {

    this.formSubmitted = false;

    this.propertyForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'propertyName': [ this.editData.propertyName || '', Validators.required ],

      'propertyType': [ _.map(this.editData.propertyType,'_id') || '', Validators.required ],
      
      'noOfUnits': [ this.editData.noOfUnits || '', Validators.required ],

      'locationUrl': [ this.editData.locationUrl || '' ],
      
      'addressLineOne': [ this.editData.addressLineOne || '', Validators.required ],

      'addressLineTwo': [ this.editData.addressLineTwo || '' ],
      
      'country': [ this.editData.country?._id || null, Validators.required ],
      
      'state': [ this.editData.state || '', Validators.required ],
      
      'city': [ this.editData.city || '', Validators.required ],

      'pincode': [ this.editData.pincode || '' , Validators.required ],

      'owner': [ _.map(this.editData.owner,'_id') || null, Validators.required ],

      'manager': [ _.map(this.editData.manager,'_id') || '', Validators.required ],

      'issues': [ _.map(this.editData.issues,'_id') || '', Validators.required ],

      'propertyImages': this.fb.array([]),

      'issueConfiguration': this.fb.array([]),

      'units': this.fb.array([]),
   
    });

    this.cdf.push(this.getConfigurationForm({}));

    if(this.mode == 'Update') {

      this.cdf.clear();

      _.forEach(this.editData?.issueConfiguration,(issueDet: any, index: number) => { 
      
        this.cdf.push(this.getConfigurationForm({ config: issueDet }));

      });

    }

    if (this.editData.propertyImages?.length) {

      this.editData.propertyImages.forEach((imageObj: any) => {

        let fullImageUrl = this.service.getFullImagePath({ imgUrl: imageObj.path });

        let preloadFile: UploadFile = {

          file: { name: imageObj.name } as File,

          preview: fullImageUrl,

          progress: 100,

          status: 'Completed',

        };
    
        this.uploadFiles.push(preloadFile);
    
        this.propertyImages.push(this.fb.control(imageObj.path));

      });

    }
  
  }
  
  changeValue(fieldName? : string , index?: number ){

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

        // 'staffList': staff,

        'staffList': '',

        'manager': '',

      })

    }

  }

  onIssuesSelected() {

    let selectedIssueIds = this.propertyForm.get('issues')?.value;
  
    let filteredIssueIds = _.compact(selectedIssueIds);
  
    this.selectedIssues = _.filter(this.masterList['issueList'], (issue: { _id: any }) =>

      _.includes(filteredIssueIds, issue._id)

    );
  
    this.issueConfigurations = _.map(this.selectedIssues, issue => ({

      'issueCategory': issue.issueName,
      
      'priority': issue.priority,
      
      'tat': issue.tat,
      
      // 'staff': issue.staff,
      
      // 'manager': issue.manager,
      
      'paidBy': issue.paidBy,
      
      'utilityAmtType': issue.utilityAmtType
    
    }));
  
    this.filteredIssueOptions = this.selectedIssues;

  }
   
  get f(): any { return this.propertyForm.controls; };

  get cdf(): any { return (<FormArray>this.propertyForm.controls["issueConfiguration"]) };

  // get upf(): any { return (<FormArray>this.propertyForm.controls["units"]) };
  
  getConfigurationForm({ config = {} } : { config?: any }) : FormGroup {

    return this.fb.group({
     
      'issueCategory': [ config?.issueCategory?._id || null ],
     
      'priority': [ config?.priority || null ],
     
      'tat': [ config?.tat || '' ],

      "tatType": [ config?.tatType || null ],
     
      'staff': [ _.map(config.staff,'_id') || null ],
     
      'manager': [ _.map(config.manager,'_id') || null ],

      'staffList': [ config?.staffList || [] ],
    
    });
  
  }

  addItem(index: number) {

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

    this.cdf.push(this.getConfigurationForm({}));

  }

  // addItem(index? :any) : any {

  //   this.formSubmitted = true;

  //   if(this.cdf.controls.every((item: any)=>item.valid)) {

  //     this.cdf.push(this.getConfigurationForm({}));  

  //   }

  // }

  deleteItem(index : any){

    this.cdf.removeAt(index);
        
    if(this.cdf.controls.length == 0) this.cdf.push(this.getConfigurationForm({}));

  }

  get propertyImages(): FormArray {return this.propertyForm.get('propertyImages') as FormArray}

  // onFileSelect(event: Event) {

  //   let input = event.target as HTMLInputElement;

  //   if (!input.files) return;

  //   Array.from(input.files).forEach((file) => {

  //     let uploadFile: UploadFile = {

  //       file,

  //       preview: URL.createObjectURL(file),

  //       progress: 0,

  //       status: 'Uploading',

  //     };

  //     this.uploadFiles.push(uploadFile);

  //     this.propertyImages.push(this.fb.control(file));

  //     this.uploadImage(uploadFile);

  //   });

  // }

  onFileSelect(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      const validTypes = ['image/jpeg', 'image/png'];

      if (!validTypes.includes(file.type)) {

        this.service.showToastr({ data: {message : "Only JPG and PNG images are allowed."}})

        return;
        
      }

      const uploadFile: UploadFile = {
        file,

        preview: URL.createObjectURL(file),

        progress: 0,

        status: 'Uploading',

      };

      this.uploadFiles.push(uploadFile);

      this.propertyImages.push(this.fb.control(file));

      this.uploadImage(uploadFile);

    });
    
  }


  // Simulate Image Upload Progress
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

    this.uploadFiles.splice(index, 1);

    this.propertyImages.removeAt(index);

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

  getCountryCode(): any {

    this.service.getService({ "url": "/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status=='ok' ? res.data : [];

    });
    
  }

  onSubmit() {

    this.formSubmitted = true;

    let payload = this.propertyForm.getRawValue();    

    payload['issueConfiguration'] = _.filter(this.propertyForm.value.issueConfiguration, (item: any) => item.issueCategory != null);    
    
    // let payload = this.propertyForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    }    

    if(this.propertyForm.invalid) return;
    
    let formData = new FormData();

    Object.keys(this.propertyForm.controls).forEach((key) => {

      if (key == 'propertyImages') {

        this.propertyForm.value.propertyImages.forEach((item: any) => {

          if (item instanceof File) {

            formData.append('propertyImages', item);

          }

        });

      } else {

        // If needed, handle other fields here
        // formData.append(key, this.propertyForm.get(key)?.value);

      }

    });

    // console.log('Payload', payload);
    
    // return;
    
    formData.append('data', JSON.stringify(payload));

    this.confirmationDialog?.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result': _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/property/create', payload : formData  }) : 
        
          this.service.patchService({ 'url': `/property/${this.editData?._id}`, payload : formData })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/property' });

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

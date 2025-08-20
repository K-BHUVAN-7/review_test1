import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-manager',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-manager.component.html',
  styleUrl: './create-manager.component.scss'
})
export class CreateManagerComponent {

constructor(private fb: FormBuilder, public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute) { }
  
  managerForm: FormGroup = new FormGroup({});
  editData:any = {};
  _: any = _;
  userDetails: any = {};
  permissions: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {}
  mode: string = "Create";
  queryParamsValue: any = {};

  pageIndex: number = 0;
  pageSize: number = 10;
  pageSizeArr: any = [];
  searchValue: any = "";

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url': '/otherUser/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId, "_id" : this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};

            this.loadForm();

          } 

        })

      } else {

        this.mode == 'Create'

        this.loadForm();

      }

    });

    this.permissions = this.service.getPermissions({ pathArr: ["Manager"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});
              
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    if(this.mode == 'Update'){ 

      this.getPropertyLevelIssueList();

      this.getUnitLevelIssueList();

      this.getTenantLevelIssueList();

    }

    this.getAllDetails();
    
    this.loadForm();

  }

  isSelected(id: string, controlName: string): boolean {

    let selected = this.managerForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  getAllDetails(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId;

    }

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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
        
        'loaderState': true

      }),

      'staff': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'staff' },
        
        'loaderState': true

      }),

      'tenantList': this.service.postService({ 

        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' },
        
        'loaderState': true

      }),

    }).subscribe({

      next: (res: any) => {

        if(res.countryIdList?.status == 'ok') this.masterList['countryIdList'] = res.countryIdList.data || [];

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];

        if(res.issue?.status == 'ok') this.masterList['issueList'] = res.issue.data;

        if(res.tenantList?.status == 'ok') this.masterList['tenantList'] = res.tenantList.data || [];

        if(res.property?.status == 'ok') {

          this.masterList['propertyList'] = _.filter(res.property?.data, (e: any) => { 
            
            return _.some(e.manager, (o: any) => o._id == this.queryParamsValue);
          
          });

           this.masterList['propertyList'] = _.map(this.masterList['propertyList'], (property: any) => {
          
            let tenantCount = _.filter(this.masterList['tenantList'], (tenant: any) => {

              return _.some(tenant.propertyName, (prop: any) => prop._id == property._id);

            }).length;

            return { ...property, tenantCount };
            
          });
          

        }

        if(res.staff?.status == 'ok') {

          this.masterList['staffList'] = _.chain(res.staff?.data).filter((staff: any) => _.some(staff.manager, { _id: this.queryParamsValue })).map((staff: any) => (
          
          {
            ...staff,
            
            issueNames: staff.issues || []

          })).uniqBy('_id') .value();

        }

      }

    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.managerForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId || this.companyId, Validators.required ],
      
      'branchId': [ this.editData.branchId || this.branchId, Validators.required ],

      'userType': [ this.editData.userTyp || 'manager' ],

      'firstName': [ this.editData?.firstName || '', [Validators.required] ],

      'lastName': [ this.editData?.lastName || '', [Validators.required] ],

      'mobileNo': [ this.editData?.mobileNo || '', [Validators.required, Validators.pattern('^[0-9]{10}$')] ],

      'email': [ this.editData?.email || '', [Validators.required, Validators.email] ],

      'addressLineOne': [ this.editData?.addressLineOne || '', [Validators.required] ],

      'addressLineTwo': [ this.editData?.addressLineTwo || '' ],

      'countryId': [ this.editData?.countryId?._id || null, [Validators.required] ],

      'state': [ this.editData?.state || '', [Validators.required] ],

      'city': [ this.editData?.city || '', [Validators.required] ],

      'pincode': [ this.editData?.pincode || '' ,[Validators.required]  ],

      'role': [ this.editData?.role?._id || null , [Validators.required] ],

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
  
  }
  
  get f(): any { return this.managerForm.controls; }

  get pif(): any { return (<FormArray>this.managerForm.controls["propertyLevelIssue"]) };

  get uif(): any { return (<FormArray>this.managerForm.controls["unitLevelIssue"]) };

  get tif(): any { return (<FormArray>this.managerForm.controls["tenantLevelIssue"]) };

  getPropertyLevelIssueForm({ property = {} } : { property?: any }) : FormGroup {

    return this.fb.group({
     
      'propertyName': [ property?.propertyName?._id || null ],
     
      'issueCategory': [ property?.issueCategory?._id || null ],
     
      'priority': [ property?.priority || null ],
     
      'tat': [ property?.tat || '', ],

      "tatType": [ property?.tatType || null ],
     
      'staff': [ _.map(property.staff,'_id') || null ],
     
      'staffList': [ property?.staffList || [] ],

      'activeDate': [ property?.activeDate || '' ],

      'inactiveDate': [ property?.inactiveDate || '' ]
    
    });
  
  }

  getUnitLevelIssueForm({ unit = {} } : { unit?: any }) : FormGroup {

    return this.fb.group({
     
      'propertyName': [ unit.propertyName?._id || null ],

      'unitName': [ unit.unitName?._id || null ],
     
      'issueCategory': [ unit?.issueCategory?._id || null,  ],
     
      'priority': [ unit?.priority || null ],
     
      'tat': [ unit?.tat || '', ],

      "tatType": [ unit?.tatType || null  ],
     
      'staff': [ _.map(unit?.staff,'_id') || null ],
     
      'staffList': [ unit?.staffList || [] ],

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
     
      'staff': [ _.map(tenant?.staff,'_id') || null ],
     
      'staffList': [ tenant?.staffList || [] ],

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
          
            _.some(o.manager, (m: any) => m._id == this.queryParamsValue)
          
          );
        
        });
        
        this.masterList['propertyLevelIssueList'] = _.uniqBy(filteredData, '_id');
  
        if (this.mode == 'Update') {

          this.pif.clear();
        
          _.forEach(filteredData, (property: any) => {
        
            _.forEach(property.issueConfiguration, (config: any) => {
        
              let hasManager = _.some(config.manager, (m: any) => m._id == this.queryParamsValue);

              if (hasManager) {
        
                let formValue = {
        
                  propertyName: {

                    '_id': property?._id,
                    
                    'propertyName': property?.propertyName
                  
                  },
        
                  'issueCategory': config?.issueCategory || null,
                  
                  'priority': config?.priority || '',
                  
                  'tat': config?.tat || '',
                  
                  'tatType': config?.tatType || '',
                  
                  'staff': config.staff || '',
                  
                  'staffList': config?.staffList || [],
                  
                  'activeDate': config?.activeDate || '',
                  
                  'inactiveDate': config?.inactiveDate || ''
                
                };
        
                this.pif.push(this.getPropertyLevelIssueForm({ property: formValue }));
              }
        
            });
        
          });
        
        }
  
        // if (this.mode == 'Update') {
  
        //   this.pif.clear();
  
        //   _.forEach(filteredData, (property: any) => {
  
        //     _.forEach(property.issueConfiguration, (config: any) => {
  
        //       if (config.manager?._id == this.queryParamsValue) {
  
        //         let formValue = {
           
        //           propertyName: {
           
        //             '_id': property?._id,
           
        //             'propertyName': property?.propertyName
           
        //           },
           
        //           'issueCategory': config?.issueCategory || null,
           
        //           'priority': config?.priority || '',
           
        //           'tat': config?.tat || '',
           
        //           'tatType': config?.tatType || '',
           
        //           'staff': config?.staff || '',
           
        //           'staffList': config?.staffList || [],
           
        //           'activeDate': config?.activeDate || '',
           
        //           'inactiveDate': config?.inactiveDate || ''
           
        //         };
  
        //         this.pif.push(this.getPropertyLevelIssueForm({ property: formValue }));

        //       }

        //     });

        //   });

        // }
  
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
          
            _.some(o.manager, (m: any) => m._id == this.queryParamsValue)
          
          );
        
        });
        
        this.masterList['unitLevelIssueList'] = _.uniqBy(filteredData, '_id');

        if (this.mode == 'Update') {
  
          this.uif.clear();

          _.forEach(filteredData, (unit: any) => {
        
            _.forEach(unit.issueConfiguration, (config: any) => {
        
              let hasManager = _.some(config.manager, (m: any) => m._id == this.queryParamsValue);

              if (hasManager) {
        
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
                  
                  'staff': config.staff || '',
                  
                  'staffList': config?.staffList || [],
                  
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

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' }
  
    this.service.postService({ url: '/otherUser/list', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {
  
        let filteredData = _.filter(res.data, (e: any) => {

          return _.some(e.issueConfiguration, (o: any) => 
          
            _.some(o.manager, (m: any) => m._id == this.queryParamsValue)
          
          );
        
        });

        this.masterList['tenantLevelIssueList'] = _.uniqBy(filteredData, '_id');

        if (this.mode == 'Update') {
  
          this.tif.clear();

          _.forEach(filteredData, (tenant: any) => {
        
            _.forEach(tenant.issueConfiguration, (config: any) => {
        
              let hasManager = _.some(config.manager, (m: any) => m._id == this.queryParamsValue);
        
              if (hasManager) {
        
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
                  
                  'staff': config.staff || '',

                  'staffList': config?.staffList || [],

                  'configName': config._id,
                  
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

  getTooltipList(list: any[], label: string): string {

    if (!list || list.length == 0) return `No ${label} found`;
  
    let formattedList = list.map((item, index) => `${index + 1}. ${item.issueName}`).join('\n');
    
    return `${label}s:\n${formattedList}`;
 
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


  // Getter for form arrays based on type
  getIssueFormArray(type: 'property' | 'unit' | 'tenant'): FormArray {

    switch (type) {

      case 'property':

        let propertyFormArray = this.managerForm.get('propertyLevelIssue') as FormArray;

        if (!propertyFormArray) return this.fb.array([]);

        return propertyFormArray;

      case 'unit':

        let unitFormArray = this.managerForm.get('unitLevelIssue') as FormArray;

        if (!unitFormArray) return this.fb.array([]);

        return unitFormArray;

      case 'tenant':

        let tenantFormArray = this.managerForm.get('tenantLevelIssue') as FormArray;

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

//   addPropertyLevelIssue(index? :any) : any {

//     this.formSubmitted = true;

//     if(this.pif.controls.every((item: any)=>item.valid)) {

//       this.pif.push(this.getPropertyLevelIssueForm({}));  

//     }

//   }

//   deletePropertyLevelIssue(index : any){

//     this.pif.removeAt(index);
        
//     if(this.pif.controls.length == 0) this.pif.push(this.getPropertyLevelIssueForm({}));

//   }

//   addUnitLevelIssue(index? :any) : any {

//     this.formSubmitted = true;

//     if(this.uif.controls.every((item: any)=>item.valid)) {

//       this.uif.push(this.getUnitLevelIssueForm({}));  

//     }

//   }

//   deleteUnitLevelIssue(index : any){

//     this.uif.removeAt(index);
        
//     if(this.uif.controls.length == 0) this.uif.push(this.getUnitLevelIssueForm({}));

//   }

//  addTenantLevelIssue(index? :any) : any {

//     this.formSubmitted = true;

//     if(this.tif.controls.every((item: any)=>item.valid)) {

//       this.tif.push(this.getTenantLevelIssueForm({}));  

//     }

//   }

//   deleteTenantLevelIssue(index : any){

//     this.tif.removeAt(index);
        
//     if(this.tif.controls.length == 0) this.tif.push(this.getTenantLevelIssueForm({}));

//   }

  submit(){

    this.formSubmitted = true;

    if(this.managerForm.invalid) return;

    let payload = this.managerForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    } 

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent : false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result': _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/otherUser/create', payload }) : 
        
          this.service.patchService({ 'url': `/otherUser/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } Successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/manager' });

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
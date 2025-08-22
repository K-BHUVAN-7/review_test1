import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-owner',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-owner.component.html',
  styleUrl: './create-owner.component.scss'
})
export class CreateOwnerComponent {

  constructor(private fb: FormBuilder, public service: CommonService, private confirmationDialog: ConfirmationDialogService, private route: ActivatedRoute) { } 
   
  ownerForm: FormGroup = new FormGroup({});
  editData:any = {};
  _: any = _;
  userDetails: any = {};
  permissions: any = {};
  formSubmitted: Boolean = false;
  masterList: any = {}
  mode: string = "Create";
  queryParamsValue: any = {};
  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.queryParamsValue = params['id'];

      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({'url' : '/otherUser/list' , payload : {'parentCompanyId' : this.userDetails.parentCompanyId , "_id" : this.queryParamsValue } }).subscribe((res: any) => {

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

    // this.getPropertyList();
    
    this.loadForm();

  }

  loadForm() {

    this.formSubmitted = false;

    this.ownerForm = this.fb.group({

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
      
      'pincode': [ this.editData?.pincode || '' ,[Validators.required]  ],
      
      'role': [ this.editData?.role?._id || null ,[Validators.required] ],
      
      'userType': [ this.editData.userType || 'owner' ],

    });
  
  }

  get f(): any { return this.ownerForm.controls; }

  getAllDetails(){

    if(_.size(this.masterList['companyList'])>1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

    'countryIdList': this.service.getService({ "url": "/countries" }),

    'rolesList': this.service.postService({'url': '/master/roles/list', payload: {'parentCompanyId': this.userDetails.parentCompanyId } }),

    'property': this.service.postService({ 

      "url": "/property/list", 
      
      payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId },
      
      'loaderState': true

    }),

    'tenantList': this.service.postService({ 

      "url": "/otherUser/list", 
      
      payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'userType': 'tenant' },
      
      'loaderState': true

    }),

    }).subscribe({

      next: (res: any) => {

        if(res.countryIdList?.status == 'ok')  this.masterList['countryIdList'] = res.countryIdList.data || [];

        if(res.rolesList?.status == 'ok') this.masterList['rolesList'] = res.rolesList.data || [];

        if(res.tenantList?.status == 'ok') this.masterList['tenantList'] = res.tenantList.data || [];

        if(res.property?.status == 'ok') {

          this.masterList['propertyList'] = res.property?.data;

          this.masterList['propertyList'] = _.filter(this.masterList['propertyList'], (e: any) => { 
            
            return _.some(e.owner, (o: any) => o._id == this.queryParamsValue);
          
          });

          this.masterList['propertyList'] = _.map(this.masterList['propertyList'], (property: any) => {

            let tenantCount = _.filter(this.masterList['tenantList'], (tenant: any) => {

              return _.some(tenant.propertyName, (prop: any) => prop._id == property._id);

            }).length;

            return { ...property, tenantCount };
            
          });

          this.masterList['managerList'] = _.uniqBy(

            _.flatMap(this.masterList['propertyList'], (property: any) => { 
              
              return (property.manager || []).map((manager: any) => ({ ...manager, 'propertyName': property.propertyName }));

            }), 'email'

          );

        }

        console.log('Property List', this.masterList['propertyList']);
      }
      
    });

    

  }

  getRemainingPropertyTooltip(propertyNames: string[]): string {

    if (_.isEmpty(propertyNames) || propertyNames.length <= 1) {
    
      return 'No more properties';
    
    }
  
    const remainingList = _.map(_.slice(propertyNames, 1), (name, index) => `${index + 1}. ${name}`).join('\n');
  
    return `Other Properties:\n${remainingList}`;
  
  }

  submit(){

    this.formSubmitted = true;

    if(this.ownerForm.invalid) return;

    let payload = this.ownerForm.getRawValue();

    if(this.mode == 'Update') {

      payload['updated_at'] = this.editData.updated_at 

    } 

    this.confirmationDialog.confirm({

      title: "Are you sure?",

      message: "Do you want to save your changes before exiting",

      type: "success",

      isContent: false

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

              this.service.navigate({ 'url': 'app/owner' });

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': `${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })

  }

}
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss',
  providers:[NgbActiveModal]

})
export class CreateRoleComponent {

  roleForm: FormGroup = new FormGroup({});
  formSubmitted: boolean = false;
  editData: any = {};
  _: any = _;
  userDetails : any  = [];
  permissions: any = [];
  masterList : any = {}
  // mode : String = 'Create'
  mode: string = 'Create';
  queryParamsValue: any = {};
  roles:any = []

  companyId : any = {};
  branchId : any = {}
  branchList : any = {};
  branchDetails: any = {}
  selectedTabIndex: number = 0;

  submitEnabled: boolean = false;

  get roleDet() { return this.editData }

  constructor(public service: CommonService, private fb: FormBuilder, private route: ActivatedRoute,private confirmationDialog: ConfirmationDialogService) {  

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.permissions = this.service.getPermissions({ pathArr: ["Masters","Roles"], isNeedBranchList: true ,'permission': ['create','view','edit','delete']});

    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList':  this.permissions.viewPermission?.branchList || []
    }
  
    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId});

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

  }

  ngOnInit(): void {

    // this.getFunction();

    this.mode = 'Create';

    this.route.queryParams.subscribe(params => {
    
      this.queryParamsValue = params['id'];
    
      if(!_.isEmpty(this.queryParamsValue)) {

        this.mode = 'Update';

        this.service.postService({ 'url': '/master/roles/list', 'payload': { '_id': this.queryParamsValue } }).subscribe((res: any) => {

          if (res.status == 'ok') {

            this.editData = _.first(res.data) || {};
            
            this.loadForm();

          }

        })

      } else {

        this.loadForm()
      }

     
    });

    // this.getFunction();

    // this.loadForm();

    this.getRoleCategory();

  }

  getFunction(){

    this.service.postService({'url' : '/master/admin/functions' , payload : {'parentCompanyId' : this.f.parentCompanyId?.value } }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['featuresList'] = res.data;

        this.loadForm();

      }

    });

  }

  getRoleCategory(){

    this.service.postService({'url' : '/settings/roleCategory'  }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['rolesCategoryList'] = res.data

      }

    });

  }

  getPermission(id?:any) {

    this.service.postService({'url' : `/setup/master/feature/${id}`,payload : { 'parentCompanyId' : this.f.parentCompanyId?.value }  }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.masterList['permission'] = res.data;
        
        this.roles =  this.masterList['permission'][0].permissions;

        this.menuConstruct();

      } 

    });

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number }):any {

    if(fieldName =='roleCategoryId') {

      const roleCategoryId = this.f.roleCategoryId.value;
    
      this.getPermission(roleCategoryId);

    }

  }  


  // initForm() {

  //   // if(!_.isEmpty(this.editData)) {

  //   //   let permissionForm = this.roleForm.get('permissions') as FormArray;

  //   //   while (permissionForm.length) permissionForm.removeAt(0);

  //   //   let savedPermissionsMap = new Map((this.editData?.permissions || []).map((perm: any) => [perm.url, perm]));

  //   //   let mergedPermissions = this.permissions.map((featureMenu: any) => {

  //   //     let savedMenu: any = savedPermissionsMap.get(featureMenu.url);

  //   //     let mergedMenu = savedMenu ?  { ...savedMenu, allow: true } :  { ...featureMenu, allow: false, branches: [] };

  //   //     if (featureMenu.subMenu) {

  //   //       let savedSubMenuMap:any = new Map((savedMenu?.subMenu || []).map((sub: any) => [sub.url, sub]));

  //   //       mergedMenu.subMenu = featureMenu.subMenu.map((subMenu: any) => {

  //   //         return savedSubMenuMap.has(subMenu.url) ?  { ...savedSubMenuMap.get(subMenu.url), allow: true } :  { ...subMenu, allow: false, branches: [] };

  //   //       })

  //   //     }

  //   //     return mergedMenu;


  //   //   })

  //   //   mergedPermissions.forEach((menuDet: any) => {permissionForm.push(this.menuForm({ menuDet }))});

  //   // }
    
  //   if (!_.isEmpty(this.editData)) {

  //     let permissionForm = this.roleForm.get('permissions') as FormArray;
    
  //     while (permissionForm.length) permissionForm.removeAt(0);
    
  //     let savedPermissionsMap = new Map((this.editData?.permissions || []).map((perm: any) => [perm.url, perm]));
    
  //     let mergedPermissions = this.permissions.map((featureMenu: any) => {

  //       let savedMenu: any = savedPermissionsMap.get(featureMenu.url);
    
  //       let mergedMenu = savedMenu

  //         ? { ...savedMenu, allow: true } // Only retain allow:true from saved data

  //         : { ...featureMenu, allow: false, branches: [] }; // Otherwise, mark as false
    
  //       if (featureMenu.subMenu) {

  //         let savedSubMenuMap = new Map((savedMenu?.subMenu || []).map((sub: any) => [sub.url, sub]));
    
  //         mergedMenu.subMenu = featureMenu.subMenu.map((subMenu: any) => {

  //           let savedSubMenu = savedSubMenuMap.get(subMenu.url);
    
  //           return savedSubMenu

  //           ? { ...savedSubMenu, allow: true } // Only allow if saved

  //           : { ...subMenu, allow: false, branches: [] }; // Otherwise, set false

  //         });

  //       }
    
  //       return mergedMenu;

  //     });
    
  //     mergedPermissions.forEach((menuDet: any) => {

  //       permissionForm.push(this.menuForm({ menuDet }));

  //     });
    
  //   }
    
  //   else {

  //     let permissionForm = this.roleForm.get('permissions') as FormArray;
    
  //     while (permissionForm.length) {

  //       permissionForm.removeAt(0);
        
  //     }

  //     _.map(this.permissions, (menuDet: any) => {

  //       permissionForm.push(this.menuForm({ menuDet }));

  //     });


  //   }

  // }

  loadForm() {

    this.formSubmitted = false;

    this.roleForm = this.fb.group({

      'parentCompanyId': [ this.editData.parentCompanyId || this.userDetails.parentCompanyId, Validators.required ],

      'companyId': [ this.editData.companyId?._id || this.companyId, Validators.required ],

      'branchId': [ this.editData.branchId?._id || this.branchId, Validators.required ],

      'roleName' : [this.editData.roleName || '' ,Validators.required],

      'roleCategoryId' : [ this.editData?.roleCategoryId?._id || null, Validators.required],

      'description': [ this.editData.description || "" ],

      'branches': this.fb.array([]),

    });

    if(this.mode == 'Update'){

      this.changeValue({'fieldName' : 'roleCategoryId'})
      
    }
    
  }

  menuConstruct(){

    // clear the branchesForm first

    this.bf.clear();

    this.branchDetails = _.filter(this.masterList['branchList'], (e) => this.f.branchId.value.includes(e._id));

    const branchesForm = this.roleForm.get('branches') as FormArray;
  
    _.map(this.branchDetails,(branchDet)=>{

      branchesForm.push(this.getBranchForm({ branchDet }));

    });

  }

  getBranchForm({ branchDet = {} }: { branchDet: any }) {

    const branchForm = this.fb.group({

      "branchId": branchDet.branchId,

      "branchName": branchDet.branchName,

      "permissions": this.fb.array([])

    });

    const permissionsForm = branchForm.get("permissions") as FormArray;

    const getMenuForm = (menuDet: any) => {

      const menuForm: FormGroup = this.fb.group({

        "allow": menuDet.allow || false,

        "icon": menuDet.icon,

        "label": menuDet.label,

        "url": menuDet.url,

        "mobile": menuDet.mobile,

        "permission": [menuDet.permission],

        "view": { value: menuDet.view || false, disabled: true },

        "create": menuDet.create || false,

        "edit": menuDet.edit || false,

        "delete": menuDet.delete || false,

        "approve": menuDet.approve || false,

        "subMenu": this.fb.array([]),
        
      });

      _.map(menuDet.subMenu,(subMenuDet)=>{

        (menuForm.get('subMenu') as FormArray).push(getMenuForm(subMenuDet));

      })

      return menuForm;

    }

    if (!_.isEmpty(this.editData.permissions)) {

      const roles = this.roles;

      const permissions = this.editData.permissions;
      
      _.map(roles, (roleDet) => {

        const matchedPerm = permissions.find((p: any) => p.label == roleDet.label);

        const currentBranch = matchedPerm?.branches?.find((b: any) => b.branchId == branchDet.branchId);
      
        const mergedMenuDet = {

          ...roleDet, 

          "allow": matchedPerm?.allow && !!currentBranch,

          "view": currentBranch?.permission?.includes('view') || false, "create": currentBranch?.permission?.includes('create') || false,

          "edit": currentBranch?.permission?.includes('edit') || false, "delete": currentBranch?.permission?.includes('delete') || false,

          "subMenu": _.map(roleDet.subMenu || [], (subRole) => {

            const matchedSub = matchedPerm?.subMenu?.find((sub: any) => sub.label == subRole.label);

            const currentSubBranch = matchedSub?.branches?.find((b: any) => b.branchId == branchDet.branchId);

            return {

              ...subRole,

              "allow": matchedSub?.allow && !!currentSubBranch, 
              
              "view": currentSubBranch?.permission?.includes('view') || false,

              "create": currentSubBranch?.permission?.includes('create') || false, "edit": currentSubBranch?.permission?.includes('edit') || false,

              "delete": currentSubBranch?.permission?.includes('delete') || false,

              "approve": currentSubBranch?.permission?.includes('approve') || false,

              "mobile":matchedSub?.allow && !!currentSubBranch,

            };

          }),

        };

        permissionsForm.push(getMenuForm(mergedMenuDet));

      });

    } else {
      
      _.map(this.roles, (roleDet) => { permissionsForm.push(getMenuForm(roleDet))});

    }

    return branchForm

  }

  get f(): any { return this.roleForm.controls; }

  get bf(): any { return this.roleForm.get('branches') as FormArray; }

  // get f(): any { return this.roleForm.controls; }

  // get pf(): any { return this.roleForm.get('permissions') as FormArray; }


  // menuForm({ menuDet = {} }: { menuDet: any }) {

  //   let menuForm = this.fb.group({

  //     "allow": [menuDet?.allow || false, Validators.required],

  //     "icon": [menuDet?.icon || ''],

  //     "label": [menuDet?.label || ''],

  //     "category": [menuDet?.category || 'global'],

  //     "url": [menuDet?.url || ''],

  //     "branches": this.fb.array([]),
      
  //     "subMenu": this.fb.array([]) 

  //   });
  
  //   let branchForm = menuForm.get('branches') as FormArray;

  //   let subMenuForm = menuForm.get('subMenu') as FormArray;
  
  //   let branches = menuDet?.branches?.length ? menuDet.branches : [{ branchId: this.branchList[0]?.branchId }];

  //   _.forEach(branches, (branchDet: any) => branchForm.push(this.branchForm({ branchDet })));
  
  //   _.forEach(menuDet.subMenu, (subMenuDet: any) => subMenuForm.push(this.menuForm({ menuDet: subMenuDet })));

  //   return menuForm;

  // }
  
  // branchForm({ branchDet = {} }: { branchDet: any }) {
    
  //   let permissions = [];

  //   if (branchDet.create) permissions.push('create');

  //   if (branchDet.edit) permissions.push('edit');

  //   if (branchDet.delete) permissions.push('delete');

  //   if (branchDet.view) permissions.push('view');
  
  //   return this.fb.group({

  //     'branchId': [branchDet?.branchId || '', Validators.required],

  //     'permission': [permissions] ,

  //     'create': [branchDet?.permission ? branchDet.permission.includes('create') : false],

  //     'edit': [branchDet?.permission ? branchDet.permission.includes('edit') : false],

  //     'delete': [branchDet?.permission ? branchDet.permission.includes('delete') : false],

  //     'view': [branchDet?.permission ? branchDet.permission.includes('view') : false]

  //   });
     
  // }
  
  // togglePermission(branchForm: any, permissionType: string): void {

  //   let permissions = branchForm.get('permission').value || [];
  
  //   if (permissions.includes(permissionType)) {

  //     permissions = permissions.filter((p: string) => p !== permissionType);

  //   } else {

  //     permissions.push(permissionType);

  //   }
  
  //   branchForm.get('permission').setValue(permissions);

  // }

  // onAllowChange(permissionForm: any): void {

  //   if (!permissionForm.get('allow').value) {

  //     permissionForm.get('branches').controls.forEach((branchForm: any) => {

  //       branchForm.get('permission').setValue([]); 
        
  //     });

  //   }

  // }

  onToggleChange(menuForm: FormGroup, subMenuForm?: FormGroup) {

    if(subMenuForm) {

      if(!subMenuForm.value.allow) {

        subMenuForm.patchValue({ "view": false, "create": false, "edit": false, "delete": false, });

      } else { subMenuForm.patchValue({ "view": true }) }

    } else if(menuForm.value.subMenu.length > 0 && !menuForm.value.allow) {

      for(let form of (menuForm.get('subMenu') as FormArray).controls) {

        form.get('allow')?.setValue(false);

        form.get('view')?.setValue(false);

      }

    } else if(menuForm.value.subMenu.length == 0) {

      if(!menuForm.value.allow) {

        menuForm.patchValue({ "view": false, "create": false, "edit": false, "delete": false, });

      } else { menuForm.patchValue({ "view": true }) }

    }

    this.checkIfAnyAllowSelected();

  }

  checkIfAnyAllowSelected(): void {

    const permissionsArray = this.bf.at(this.selectedTabIndex).get('permissions') as FormArray;

    this.submitEnabled = permissionsArray.controls.some(group => {
      
      const menuGroup = group as FormGroup;

      if (menuGroup.get('allow')?.value) return true;

      const subMenuArray = menuGroup.get('subMenu') as FormArray;

      return subMenuArray.controls.some(sub => sub.get('allow')?.value);
    
    });
 
  }

  submit(){

    this.formSubmitted = true

    if(this.roleForm.invalid) return

    let payload = this.roleForm.getRawValue();

    payload = {

      "parentCompanyId": payload.parentCompanyId,

      "roleName": payload.roleName,

      "branchId": payload.branchId,

      'roleCategoryId' : this.f.roleCategoryId.value,

      'description': payload.description,
      
      "permissions": _.filter(_.map(this.roles,(elem,index)=> {

        let permissionDet = {

          ...elem,

          "branches": _.reduce(payload.branches,(prev: any,branchDet: any)=>{

            let menuDet = branchDet.permissions[index];

            return [ 
              
              ...prev,
              
              ...menuDet.allow ? [{ 
                
                "branchId": branchDet.branchId,

                "permission": [
                  ...menuDet.view ? ["view"] : [],
                  ...menuDet.create ? ["create"] : [],
                  ...menuDet.edit ? ["edit"] : [],
                  ...menuDet.delete ? ["delete"] : [],
                  ...menuDet.download ? ["download"] : [],
                  ...menuDet.approve ? ["approve"] : [],
                  ...menuDet.print ? ["print"] : [],
                ]

              }] : []

            ]

          },[]),

          "subMenu": _.filter(_.map(elem.subMenu,(elem2,indx) => {

            let permissionDet = {

              ...elem2,

              "branches":  _.reduce(payload.branches,(prev: any,branchDet: any)=>{

                let menuDet = branchDet.permissions[index].subMenu[indx];
    
                return [ 
                  
                  ...prev,
                  
                  ...menuDet.allow ? [{ 
                    
                    "branchId": branchDet.branchId,
    
                    "permission": [
                      ...menuDet.view ? ["view"] : [],
                      ...menuDet.create ? ["create"] : [],
                      ...menuDet.edit ? ["edit"] : [],
                      ...menuDet.delete ? ["delete"] : [],
                      ...menuDet.download ? ["download"] : [],
                      ...menuDet.approve ? ["approve"] : [],
                      ...menuDet.print ? ["print"] : [],
                    ]
    
                  }] : []
    
                ]
    
              },[])

            };

            return { ...permissionDet, "allow": permissionDet.branches.length > 0 }

          }),(e)=>e.branches.length>0)

        }

        return { ...permissionDet, 'allow': permissionDet.branches.length > 0 };

      }),(e)=>e.branches.length>0)
    
    }
    
    let companyIds = _(this.masterList['branchList']) .filter(e => payload['branchId'].includes(e?._id)).map('companyId').uniq().value();
        
    payload = _.extend(payload, { "companyId": companyIds });

    // this.confirmationDialog.confirm({ 

    //   'message': `Do you want to ${this.mode}?`, 
        
    //   'title': 'Success'

    // }).then((confrimation:any) => {

    //   if(confrimation){

    //     forkJoin({

    //       'result' : _.isEmpty(this.editData) ?

    //       this.service.postService({ 'url': '/settings/roles/create', payload }) : 
        
    //       this.service.patchService({ 'url': `/settings/roles/${this.editData?._id}`, payload })

    //     }).subscribe({

    //       next: (value: any) => { 

    //         if(value.result.status=='ok') {

    //           this.formSubmitted = false;

    //           this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });

    //           this.service.navigate({ 'url': '/settings/roles' });

    //         }

    //       },

    //     })

    //   }

    // })

    this.confirmationDialog.confirm({

      title: "Save",

      message: "Do you want to save ?",

      type: "success",

      isContent : false

    }).then((confrimation:any) => {

      if(confrimation){

        forkJoin({

          'result' : _.isEmpty(this.editData) ?

          this.service.postService({ 'url': '/master/roles/create', payload }) : 
        
          this.service.patchService({ 'url': `/master/roles/${this.editData?._id}`, payload })

        }).subscribe({

          next: (value: any) => { 

            if(value.result.status=='ok') {

              this.formSubmitted = false;

              this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });

              this.service.navigate({ 'url': 'app/masters/roles' });

            }

          },

          error: (err: any) => {

            this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
          }

        })

      }

    })
  
  }
  
  // submitForm(){

  //   this.formSubmitted = true

  //   let payload = this.roleForm.getRawValue();

  //   return
    
  //   payload.permissions = payload.permissions

  //   .filter((menu: any) => menu.allow) 

  //   .map((menu: any) => {

  //     menu.branches = menu.branches.map((branch: any) => {

  //       let permissions: string[] = [];

  //       if (branch.create) permissions.push('create');

  //       if (branch.edit) permissions.push('edit');

  //       if (branch.delete) permissions.push('delete');

  //       if (branch.view) permissions.push('view');

  //       branch.permission = permissions;

  //       delete branch.create;

  //       delete branch.edit;

  //       delete branch.delete;

  //       delete branch.view;

  //       return branch;

  //     });

  //     if (menu.subMenu && Array.isArray(menu.subMenu)) {

  //       menu.subMenu = menu.subMenu.map((sub: any) => {

  //         sub.branches = sub.branches.map((subBranch: any) => {

  //           let subPermissions: string[] = [];

  //           if (subBranch.create) subPermissions.push('create');

  //           if (subBranch.edit) subPermissions.push('edit');

  //           if (subBranch.delete) subPermissions.push('delete');

  //           if (subBranch.view) subPermissions.push('view');

  //           subBranch.permission = subPermissions;

  //           delete subBranch.create;

  //           delete subBranch.edit;

  //           delete subBranch.delete;

  //           delete subBranch.view;

  //           return subBranch;

  //         });

  //         return sub;

  //       });

  //     }

  //     return menu;
      
  //   });

  //   this.confirmationDialog.confirm({

  //     title: "Save",

  //     message: "Do you want to save ?",

  //     type: "success",

  //     isContent : false

  //   }).then((confrimation:any) => {

  //     if(confrimation){

  //       forkJoin({

  //         'result' : _.isEmpty(this.editData) ?

  //         this.service.postService({ 'url': '/master/roles/create', payload }) : 
        
  //         this.service.patchService({ 'url': `/master/roles/${this.editData?._id}`, payload })

  //       }).subscribe({

  //         next: (value: any) => { 

  //           if(value.result.status=='ok') {

  //             this.formSubmitted = false;

  //             this.service.showToastr({ "data": { "message": `${ this.mode == 'Create' ? 'Added' : 'Updated' } successfully`, "type": "success" } });

  //             this.service.navigate({ 'url': 'app/masters/roles' });

  //           }

  //         },

  //         error: (err: any) => {

  //           this.service.showToastr({ 'data': { 'message': ` ${err.error.message}`, 'type': 'error' } });
        
  //         }

  //       })

  //     }

  //   })
    

  // }

}
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonToastrComponent } from '@app/shared/components/common-toastr/common-toastr.component';
import { ToastrConfigData } from '@app/shared/components/common-toastr/toastr-data.interface';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { APP_CONFIG } from '@env/environment';
import moment from 'moment';
import { ConfirmationDialogService } from '@shared/confirmation-dialog/confirmation.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  public loaderApiUrls = new BehaviorSubject<any>([]);
  
  userDetails: any = {};

  currencyCode: any = {};

  countryList: any = [];

  private channel: BroadcastChannel;

  constructor(public router: Router,private apiservice: ApiService, private snackBar: MatSnackBar ,public fb: FormBuilder, public confirmationDialog: ConfirmationDialogService) {

    this.channel = new BroadcastChannel('menu_channel');

    this.userDetails = JSON.parse(this.session({ "method": "get", "key": "UserDetails" })) || {};

    this.currencyCode = JSON.parse(this.session({ "method": "get", "key": "setupConfig" })) || {};

    // this.getCountryCode();

  }

  ngOnInit(): void {

    // this.getCountryCode();

    
  }

  // getCountryCode(): any {

  //   this.getService({ "url": "/countries" }).subscribe((res: any) => {

  //     this.countryList = res.status=='ok' ? res.data : [];

  //   });
    
  // }
  
  logout() {
    
    this.confirmationDialog.confirm({
  
      title: "Logout",

      message: "Are you sure want to logout from this session?",

      type: "info",

      isContent: false

    }).then((confrimation:any) => {

      if(confrimation){

        // this.session({ "method": "clear" });

        // this.navigate({ "url": '/auth/login' });

        sessionStorage.clear();

        this.router.navigate(["/auth/login"]);

        this.showToastr({ data: { title : "Logged Out! ", message: " We will meet later 👋 ",type : "success"}, });

      }

    })

  }

  // Common SnackBar Toastr
  showToastr(toastData : ToastrConfigData) {    

    let data : any = toastData;
    
    toastData['data']['type'] = toastData?.data?.type !== undefined ? toastData?.data?.type : 'info';

    toastData['duration']= toastData?.duration !== undefined ? toastData?.duration : 2500;

    toastData['horizontalPosition'] = toastData?.horizontalPosition !== undefined ? toastData?.horizontalPosition : "center";

    toastData['verticalPosition'] = toastData?.verticalPosition !== undefined ? toastData?.verticalPosition : "top";
    
    this.snackBar.openFromComponent(CommonToastrComponent, data);

  }

  session({ method = "get", key = "", value = {} } :{ method: "get" | "set" | "remove" | "clear", key?: string, value?: any }): any {

    if(method == "get") {

      let sessionData = window.sessionStorage.getItem(key);  

      return sessionData ? APP_CONFIG.encryptedReq ? this.apiservice.decryptData(sessionData) : sessionData : null;

    }

    else if(method == "set") {

      APP_CONFIG.encryptedReq ? value = this.apiservice.encryptData(value) : "";

      sessionStorage.setItem(key,value);

    }

    else if(method == "remove") window.sessionStorage.removeItem(key);

    else if(method == "clear") window.sessionStorage.clear();

  }

  navigate({ url = "", queryParams = {} }:{url: string, queryParams?: any}) {

    this.router.navigate([url], { queryParams });

  }
  
  sendMessage(message: any): void {

    this.channel.postMessage(message);
    
  }

  // POST API Method While Pass JSON Data
  postService({ url = "", payload = {}, params = {}, loaderState = false} : {url: string, payload?: any, params?: any, loaderState?: boolean}): any {

    if (loaderState) this.loaderApiUrls.subscribe(item => { item.push(this.apiservice.baseUrl + url); });

    return this.apiservice.postService(url, payload, params);
    
  }

  // GET Method While Getting File
  getFile({ url = "", params = {} } : {url: string, params?: any}): Observable<Blob> {

    return this.apiservice.getFile(url,params);

  }
  
  // PATCH API Method
  patchService({ url = "", payload = {}, params = {}} : {url: string, payload?: any, params?: any}): any {

    return this.apiservice.patchService(url, payload, params);

  }
  
  // PUT API Method
  putService(url: string, data?: any, params?: any): any {

    return this.apiservice.putService(url, data, params);

  }

  matchValidator(controlName: string, matchingControlName: string): any {

    return (formGroup: FormGroup) => {

        const control = formGroup.get(controlName);
        
        const matchingControl = formGroup.get(matchingControlName);
        
        if (matchingControl!.errors && !matchingControl!.errors?.['confirmedValidator']) return null;

        if (control!.value !== matchingControl!.value) {

          const error = { confirmedValidator: 'Passwords not match.' };

          matchingControl!.setErrors(error);

          return error;

        } else {

          matchingControl!.setErrors(null);

          return null;

        }

    }

  }  

  // GET API Method  
  getService({ url = "", params = {}, loaderState = false } : { url: string, params?: any, loaderState?: boolean }): any {

    if (loaderState) this.loaderApiUrls.subscribe(item => { item.push(this.apiservice.baseUrl + url); });

    return this.apiservice.getService(url,params);

  }

  deleteService(url: string, params?: any): any {

    return this.apiservice.deleteService(url, params);

  }


  // getFullImagePath({ imgUrl = "", baseUrlFrom = 'IMG_URL' as keyof typeof APP_CONFIG }: { imgUrl: any, baseUrlFrom?: keyof typeof APP_CONFIG}): string {


  //   // Replace backslashes with forward slashes
  //   const imagePath = (imgUrl || "")?.replace(/\\/g, '/');

  //   return (APP_CONFIG[baseUrlFrom] +'/'+ imagePath).toString();

  // }

  getFullImagePath({imgUrl = "",baseUrlFrom = 'IMG_URL' as keyof typeof APP_CONFIG}: { imgUrl: any; baseUrlFrom?: keyof typeof APP_CONFIG }): string {
    
    const imagePath = typeof imgUrl == 'string' ? imgUrl.replace(/\\/g, '/') : '';

    return `${APP_CONFIG[baseUrlFrom]}/${imagePath}`;

  }
  

  // getPermissions({ pathArr = [], isNeedBranchList = false, permission =  [] } : { pathArr?: Array<any>, isNeedBranchList?: boolean, permission?: Array<String> }) {

  //   let permissionDetails = JSON.parse(this.session({ "method": 'get', "key": "Permissions" }));    

  //   let branches = JSON.parse(this.session({ "method": "get", "key": "Branches" })); 
    
  //   let menuPermissionDet: any, permissionDet: any = {};

  //   if(pathArr.length == 1 ) {

  //     permissionDet = permissionDetails[pathArr[0]]['permissions'] || {};

  //   } 

  //   else {

  //     pathArr.forEach((menuName: any, index: number) => {

  //       menuPermissionDet = index == 0 ? permissionDetails[menuName] : menuPermissionDet[menuName];

  //       index < pathArr.length-1 ? menuPermissionDet = menuPermissionDet?.subMenu || {} : '';
        
  //     });

  //     permissionDet = menuPermissionDet?.permissions || {};

  //   }    

  //   if(isNeedBranchList) {

  //     if(!_.isEmpty(permission)) {

  //       return _.reduce(["view", "create", "edit", "delete", "print", "download"],(initialValue,permissionName) => {

  //         if(_.includes(permission,permissionName)) {

  //           let keyName = permissionName+'Permission';

  //           let specficPermissionDet = _.reduce(permissionDet,(initValue,permissions,branchId) => {

  //             if(_.includes(permissions,permissionName)) initValue[branchId] = permissions;

  //             return initValue;

  //           },<any>{});

  //           let branchList = _.map(specficPermissionDet,(value: any,branchId: string) =>_.pick(_.find(branches, { branchId }),['branchId','branchCode','branchName','companyId','companyCode','companyName'])) || [];

  //           // let branchList 

  //           initialValue = _.merge(initialValue,{

  //             [keyName]: { branchList, companyList: _.uniqBy(_.map(branchList,(e)=>_.pick(e,['companyId','companyCode','companyName'])),'companyId') || [], 'branchIds': _.map(branchList,'branchId') || [] }

  //           });


  //         }

  //         return initialValue;

  //       },{});

  //     } else { 

  //       let branchList = _.map(permissionDet,(value: any,branchId: string) =>_.pick(_.find(branches, { branchId }),['branchId','branchCode','branchName','companyId','companyCode','companyName']));

  //       let companyList = _.uniqBy(_.map(branchList,(e)=>_.pick(e,['companyCode','companyName','companyId'])),'companyId');
  
  //       return { "permissions": permissionDet, companyList, branchList };

  //     }

  //   }

  //   if(!_.isEmpty(permission)) {
    
  //     permissionDet = _.reduce(permissionDet,(initialValue,permissions,branchId) => {

  //       if(_.intersection(permission,permissions).length > 0) initialValue = _.merge(initialValue,{ [branchId]: permissions });

  //       return initialValue; 

  //     },{});
      
  //   }

  //   return permissionDet;

  // }

  changeSelectAll(event: any, sourceArray: any) {

    sourceArray = sourceArray.map((e: any)=>{

      e.checked = event.target.checked;

      return e;

    })

  }

  getPermissions({ pathArr = [], isNeedBranchList = false, permission =  [] } : { pathArr?: Array<any>, isNeedBranchList?: boolean, permission?: Array<String> }) {

    let permissionDetails = JSON.parse(this.session({ "method": 'get', "key": "Permissions" }));    

    let branches = JSON.parse(this.session({ "method": "get", "key": "Branches" }));

    let menuPermissionDet: any, permissionDet: any = {};

    if(pathArr.length == 1 ) {

      let menuKey = pathArr[0]

      if (permissionDetails[menuKey]) permissionDet = permissionDetails[menuKey]['permissions'] || {};

      else {

        let foundMenu:any = Object.values(permissionDetails).find((category: any) => category?.subMenu?.[menuKey]);

        permissionDet = foundMenu ? foundMenu.subMenu[menuKey]['permissions'] || {} : {};

      }

    }

    else {

      pathArr.forEach((menuName: any, index: number) => {

        menuPermissionDet = index == 0 ? permissionDetails[menuName] : menuPermissionDet[menuName];

        index < pathArr.length-1 ? menuPermissionDet = menuPermissionDet?.subMenu || {} : '';
       
      });

      permissionDet = menuPermissionDet?.permissions || {};

    }  

    if(this.userDetails.isAdminUser) {

      let allBranchList = branches.map((b: any) => _.pick(b, ['branchId', 'branchCode', 'branchName', 'companyId', 'companyCode', 'companyName', "_id"]));
     
      let allCompanyList = _.uniqBy(allBranchList.map((b: any) => ({..._.pick(b, ['companyId', 'companyName']),_id: b.companyId  })),'companyId');

      return {

        viewPermission: { branchList: allBranchList, companyList: allCompanyList, branchIds: _.map(allBranchList, 'branchId') },

        createPermission: { branchList: allBranchList, companyList: allCompanyList, branchIds: _.map(allBranchList, 'branchId') },

        editPermission: { branchList: allBranchList, companyList: allCompanyList, branchIds: _.map(allBranchList, 'branchId') },

        deletePermission: { branchList: allBranchList, companyList: allCompanyList, branchIds: _.map(allBranchList, 'branchId') },

        approvalPermission: { branchList: allBranchList, companyList: allCompanyList, branchIds: _.map(allBranchList, 'branchId') }

      };

    }
     
    if(isNeedBranchList) {

      if(!_.isEmpty(permission)) {

        return _.reduce(["view", "create", "edit", "delete", "approve","print", "download"],(initialValue,permissionName) => {

          if(_.includes(permission,permissionName)) {

            let keyName = permissionName+'Permission';

            let specficPermissionDet = _.reduce(permissionDet,(initValue,permissions,branchId) => {

              if(_.includes(permissions,permissionName)) initValue[branchId] = permissions;

              return initValue;

            },<any>{});

            let branchList = _.map(specficPermissionDet,(value: any,branchId: string) =>_.pick(_.find(branches, { branchId }),['branchId','branchName','companyId','companyName', "_id"])) || [];

            // let branchList

            initialValue = _.merge(initialValue,{

              [keyName]: { branchList, companyList: _.uniqBy(_.map(branchList,(e)=>_.pick(e,['companyId','companyCode','companyName'])),'companyId') || [], 'branchIds': _.map(branchList,'branchId') || [] }

            });


          }

          return initialValue;

        },{});

      } else {

        let branchList = _.map(permissionDet,(value: any,branchId: string) =>_.pick(_.find(branches, { branchId }),['branchId','branchCode','branchName','companyId','companyCode','companyName']));

        let companyList = _.uniqBy(_.map(branchList,(e)=>_.pick(e,['companyCode','companyName','companyId', '_id'])),'companyId');
 
        return { "permissions": permissionDet, companyList, branchList };

      }

    }

    if(!_.isEmpty(permission)) {
   
      permissionDet = _.reduce(permissionDet,(initialValue,permissions,branchId) => {

        if(_.intersection(permission,permissions).length > 0) initialValue = _.merge(initialValue,{ [branchId]: permissions });

        return initialValue;

      },{});
     
    }

    return permissionDet;

  }

  login(responseData:any){

    this.session({ "method": "set", "key": "AuthToken", "value": responseData.token });

    this.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(responseData.userDetails) });

    this.userDetails = responseData.userDetails;

    this.currencyCode = responseData.currencyCode;

    if(_.isEmpty(responseData?.companyDetails)){

      this.router.navigate(['/auth/company-register']);

    } else {

      this.session({ "method": "set", "key": "setupConfig", "value": JSON.stringify(responseData.currencyCode) });

      this.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(responseData.companyDetails) });

      this.session({ "method": "set", "key": "Branches", "value": JSON.stringify(responseData.branchDetails) });

      this.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(responseData.userDetails) });

      let menuList: any[] = [];
      
      let permissions: any = {};

      const isAdmin =  responseData.userDetails.isAdminUser;

      if(isAdmin) {

        _.forEach(responseData.permissions.menuList, (menuDet: any) => {

          let processSubMenu:any = (subMenu: any[]) => {

            return subMenu.map(sub => ({

              "allow": true, "icon": sub.icon || "", "label": sub.label || "", "url": sub.url || "",

              "mobile": sub.mobile || false, "permission": sub.permission || [],

              "subMenu": sub.subMenu ? processSubMenu(sub.subMenu) : [] 

            }));

          };
    
          let menuDetails: any = {

            "allow": true, "icon": menuDet.icon || "", "label": menuDet.label || "",

            "url": menuDet.url || "", "mobile": menuDet.mobile || false,

            "permission": menuDet.permission || [],

            "subMenu": menuDet.subMenu ? processSubMenu(menuDet.subMenu) : []

          };
    
          menuList.push(menuDetails);
      
        });

      } else {

        _.forEach(responseData.permissions.menuList,(menuDet: any)=>{

          permissions[menuDet.label] = _.reduce(menuDet.branches,(initialValue,branchDet)=>{ 
    
            if(_.size(branchDet.permission) > 0)
            
              initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission }); 
              
            return initialValue 
          
          },{ "permissions": {}, "subMenu": {} }); 
    
          if(menuDet.url) {
    
            let menu = _.cloneDeep(menuDet);
    
            menu['subMenu'] = _.toArray(_.pickBy(_.map(menuDet.subMenu,(smOne: any): any =>{
    
              permissions[menuDet.label]['subMenu'][smOne.label] = _.reduce(smOne.branches,(initialValue,branchDet)=>{ 
              
                if(_.size(branchDet.permission) > 0)
                
                  initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission });
                  
                return initialValue; 
              
              },{ "permissions": {}, "subMenu": {} });       
    
              if(!smOne.url) return null;
    
                smOne['subMenu'] = _.toArray(_.pickBy(_.map(smOne.subMenu,(smTwo: any): any => {
    
                    permissions[menuDet.label]['subMenu'][smOne.label]['subMenu'][smTwo.label] = 
                    
                    _.reduce(smTwo.branches,(initialValue,branchDet)=>{ 
                  
                      if(_.size(branchDet.permission) > 0)
                      
                        initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission }); 
                        
                      return initialValue;
                    
                    },{ "permissions": {}, "subMenu": {} }); 
    
                    if(!smTwo.url) return null;
    
                    smTwo['subMenu'] = _.toArray(_.pickBy(_.map(smTwo.subMenu,(smThree: any): any => {
    
                      permissions[menuDet.label]['subMenu'][smOne.label]['subMenu'][smTwo.label]['subMenu'][smThree.label] = 
                      
                      _.reduce(smThree.branches,(initialValue,branchDet)=>{ 
                    
                        if(_.size(branchDet.permission) > 0)
                        
                          initialValue['permissions'] = _.extend(initialValue.permissions,{ [branchDet.branchId]: branchDet.permission });  
                          
                        return initialValue;
                      
                      },{ "permissions": {}, "subMenu": {} }); 
    
                      if(!smThree.url) return null;
    
                      smThree['subMenu'] = _.filter(smThree.subMenu,(item: any): any => item.url != '');
    
                      if(_.size(smThree['subMenu']) == 0) delete smThree['subMenu'];
    
                      return _.omit(smThree,"branches")
    
                    })));
    
                    if(_.size(smTwo['subMenu']) == 0) delete smTwo['subMenu'];
    
                    return _.omit(smTwo,"branches")
    
                })));
                
                if(_.size(smOne['subMenu']) == 0) delete smOne['subMenu'];
    
                return _.omit(smOne,"branches")
    
            })));
    
            _.size(menu['subMenu']) == 0 ? delete menu['subMenu'] : null;
    
            menuList.push(_.omit(menu,'branches'));
    
          }
    
        });
    
        this.session({ "method": "set", "key": "Permissions", "value": JSON.stringify(permissions) });
    
      }

      const firstMenuItem = _.first(menuList);

      const url = _.get(firstMenuItem, "subMenu[0].url", firstMenuItem?.url); 

      this.session({ "method": "set", "key": "MenuList", "value": JSON.stringify(menuList) });
      
      this.session({ "method": "set", "key": "Permissions", "value": JSON.stringify(permissions) });
      
      this.navigate({ url: `/app/${url}` });
      
    }
  
  }
  commaType: any = [

    {"type": "#,###,###,### [Million]" , "value" : "#,###,###,###" },

    {"type": "#,##,##,##,###" , "value" : "#,##,##,##,###" },
    
  ]

  changePayloadDateFormat({ data = {}, fields = [] }: { data: any, fields: Array<any> }) {

    for(let fieldName of fields) {

      let fieldNameList = _.split(fieldName,".");

        if(_.size(fieldNameList) == 1) {

            data[fieldName] = _.isEmpty(data[fieldName]) ? null : moment(data[fieldName]).format("YYYY-MM-DD")

        } else if(_.size(fieldNameList) > 1) { 
            
            if(fieldNameList[1] == '$[]') {
                
                data[fieldNameList[0]] = _.map(data[fieldNameList[0]],(e: any) => {

                    e[fieldNameList[2]] = _.isEmpty(e[fieldNameList[2]]) ? null : moment(e[fieldNameList[2]]).format("YYYY-MM-DD");

                    return e;

                });

            } 
            
            if(_.size(fieldNameList) == 2) {

              data[fieldNameList[0]][fieldNameList[1]] = _.isEmpty(data[fieldNameList[0]][fieldNameList[1]]) ? null : moment(data[fieldNameList[0]][fieldNameList[1]]).format("YYYY-MM-DD")     

            }

        }
        
    }

  }

}

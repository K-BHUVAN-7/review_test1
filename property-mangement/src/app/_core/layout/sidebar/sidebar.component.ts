import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
// import { ConfirmationDialogService } from '@app/shared/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('dropInOutAnim', [
      transition(':enter', [
        style({ opacity: 0, top: -10 }), //apply default styles before animation starts
        animate(
          '.5s ease-in-out',
          style({ opacity: 1, top: 0 })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, top: 0 }), //apply default styles before animation starts
        animate(
          '.5s ease-in-out',
          style({ opacity: 0, top: -10 })
        ),
      ]),
    ]),
  ],
})
export class SidebarComponent {

// isMenuOpen: boolean = true;
  
//   subscriptionDetails: any = {};

//   @Input() set menuOpen(value: boolean) { 
    
//     this.isMenuOpen = value; 
  
//   }
//   @Input() isSalaryPage!: boolean;
//   @Output() menuEvent: EventEmitter<Boolean> = new EventEmitter();
//   @Output() menuItemSelected = new EventEmitter<any>();
//   _: any = _;
//   isMobile = window.innerWidth < 768; 
//   priceSubscription: Subscription = new Subscription();
//   @HostListener('window:resize', ['$event'])

//   onResize() {
//     this.isMobile = window.innerWidth < 768; 
//   }
//   salaryMenuList: Array<any> = [];
//   salaryComponents: Array<any> = [];

  // menuList: Array<any> = [
  //   {
  //     'label': 'Dashboard',
  //     'url': '/pages/dashboard',
  //     "allow" :  true
  //   },
  //   {
  //     'label': 'Employees',
  //     'url': '/pages/employees',
  //     'allow' : true
  //   },
  //   {
  //     'label': 'Attendance',
  //     'url': '/pages/attendance',
  //     'allow' : true,
  //     'isExpand' : true,
  //     'subMenu': [
  //       {
  //         'label':'OverAll',
  //         'url':'/pages/attendance/overall',
  //         'allow' : true,
  //         'isExpand' : true  
  //       },
  //       {
  //         'label':'Configure',
  //         'url':'/pages/attendance/configure',
  //         'allow' : true,
  //         'isExpand' : true  
  //       },
  //       {
  //         'label':'Day close',
  //         'url':'/pages/attendance/dayclose',
  //         'allow' : true,
  //         'isExpand' : true 
  //       }
       
  //     ]
  //   },    
  //   {
  //     'label': 'Pay Runs',
  //     'url': '/pages/payruns',
  //     'allow' : true
  //   },
  //   {
  //     'label': 'Approvals',
  //     'url': '/pages/approvals',
  //     'allow' : true
  //   },
   
  //   // {
  //   //   'label': 'Form 16',
  //   //   'url': '/pages/Form 16',
  //   //   'allow' :  true,
  //   // },
  //   // {
  //   //   'label': 'Loans',
  //   //   'url': '/pages/loans',
  //   //   'allow' : true
  //   // },
  //   // {
  //   //   'label': 'Documents',
  //   //   'url': '/pages/documents',
  //   //   'allow' : true
  //   // },
  //   // {
  //   //   'label': 'Giving',
  //   //   'url': '/pages/giving',
  //   //   'allow' : true
  //   // },
  //   // {
  //   //   'label': 'Reports',
  //   //   'url': '/pages/Reports',
  //   //   'allow' : true
  //   // },
  //   {
  //     'label': 'Settings',
  //     'url': '/pages/settings',
  //     'allow' : true,
  //     'isExpand' : false,
  //     'subMenu': [
  //       {
  //         'label':'Organisation Profile',
  //         'url':'/pages/settings/organisation-profile',
  //         'allow' : true,
  //         'isExpand' : true  
  //       },
  //       {
  //         'label':'Departments',
  //         'url':'/pages/settings/departments',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Designations',
  //         'url':'/pages/settings/designations',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Work / Branches locations',
  //         'url':'/pages/settings/work-locations',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Salary Component',
  //         'url':'/pages/settings/salary',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Salary Templates',
  //         'url':'/pages/settings/salary-templates',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Pay Schedule',
  //         'url':'/pages/settings/pay-schedule',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Employee Categories',
  //         'url': '/pages/settings/employee-categories',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Grade',
  //         'url': '/pages/settings/grade',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label': 'Shift Timings',
  //         'url': '/pages/settings/shift-timings',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label':'Overtime',
  //         'url':'/pages/settings/overtime',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label': 'Holidays',
  //         'url': '/pages/settings/holidays',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label': 'Leave Types',
  //         'url': '/pages/settings/leave-types',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label': 'Document',
  //         'url': '/pages/settings/document',
  //         'allow' : true,
  //         'isExpand' : true
  //       },
  //       {
  //         'label': 'Teams',
  //         'url': '/pages/team',
  //         'allow' : true
  //       },
  //       // {
  //       //   'label': 'Pay Frequency',
  //       //   'url': '/pages/settings/pay-frequency',
  //       //   'allow' : true,
  //       //   'isExpand' : true
  //       // }
        
  //     ]
  //   },    

  // ];
  
  // menu  : any = JSON.parse(sessionStorage.getItem("MenuList") || '')

  // menuList: Array<any> =  this.menu[0].permissions

  // selectedSubMenuItems: any[] = [];

  // constructor(private router: Router, private service: CommonService) { 

  // }

  // ngOnInit(): void {

  //   this.selectMenuChanges();

  // }


  
  // onMenuClick(menuItem: any) {

  //   menuItem.isExpanded = !menuItem.isExpanded;

  // }

  // onPlusIconClick(subMenuItem: any): void {

  //   subMenuItem.isSelected = !subMenuItem.isSelected; 

  //   this.service.sendMessage(subMenuItem)

  // }

  // selectMenuChanges(url?: any) {

  //   if(_.isEmpty(url)) {

  //     this.menuList = _.map(this.menuList,(menuDet: any)=>{

  //       menuDet['isExpand'] = false;

  //       menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

  //         subMenuOneDet['isExpand'] = false;

  //         subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

  //           subMenuTwoDet['isExpand'] = false;

  //           return subMenuTwoDet;

  //         });

  //         return subMenuOneDet;

  //       });

  //       return menuDet;

  //     });

  //   } else {

  //     this.menuList = _.map(this.menuList,(menuDet: any)=>{

  //       menuDet['isExpand'] = menuDet.url == url[0];
  
  //       menuDet['isSelected'] = menuDet.url == url[0];
  
  //       menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{
  
  //         subMenuOneDet['isExpand'] = subMenuOneDet.url == url[0] + '/' + url[1];
  
  //         subMenuOneDet['isSelected'] = subMenuOneDet.url == url[0] + '/' + url[1];
  
  //         subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{
  
  //           subMenuTwoDet['isExpand'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];
  
  //           subMenuTwoDet['isSelected'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];
  
  //           return subMenuTwoDet;
  
  //         });
  
  //         return subMenuOneDet;
  
  //       })

  //       return menuDet;
  
  //     });      

  //   }

  // }

  // openMenu({ path = "", menuLevel = 0, menuDetail = {} }: { path?: string, menuLevel?: number, menuDetail?: any }): any {

  //   this.isMenuOpen = true;

  //   this.menuEvent.emit(this.isMenuOpen);

  //    let url = path;

  //    let menu = url;

  //    let subMenuOne = '/' + url[0] + '/' + url[1] + '/' + url[2];

  //    let subMenuTwo = '/' + url[0] + '/' + url[1] + '/' + url[2] + '/' + url[3];

  //    this.menuList = _.map(this.menuList,(menuDet: any)=>{

  //     menuDet['isExpand'] = menuDet.url == menu && menuLevel == 0 ? !menuDet['isExpand'] : menuDet.url != menu ? false : menuDet['isExpand'];

  //     menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

  //       subMenuOneDet['isExpand'] = subMenuOneDet.url == subMenuOne && menuLevel == 1 ? !subMenuOneDet['isExpand'] : subMenuOneDet.url != subMenuOne ? false : subMenuOneDet['isExpand'];

  //         subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

  //           subMenuTwoDet['isExpand'] = subMenuTwoDet.url == subMenuTwo && menuLevel == 2 ? !subMenuTwoDet['isExpand'] : subMenuTwoDet.url != subMenuTwo ? false : subMenuTwoDet['isExpand'] ;
  
  //           return subMenuTwoDet;
  
  //         });

  //       return subMenuOneDet;

  //     });

  //     return menuDet;

  //   });

  // }

  isActive(url: string): boolean {

    const currentUrl = this.router.url.split('/')[2]; // Remove query parameters

    return currentUrl == url;

  }

  isSubMenuActive(url: string){

    const currentUrl = this.router.url.split('/')[3]; // Remove query parameters
    
    url = url.split('/')[1];

    return currentUrl == url;

  }

  isMenuOpen: Boolean = true;
  userDetails: any = {}
  logoUrl : any;
  _: any = _;
  menuList: any = {}
  @Input() isSalaryPage!: boolean;


  @Input() set menuStatus(value: Boolean) { this.isMenuOpen = value }

  get menuStatus() { return this.isMenuOpen; }

  @Output() menuEvent: EventEmitter<Boolean> = new EventEmitter();
  

  constructor(public service: CommonService, private router: Router) {

    // this.logoUrl = service.getLogoImage({'parentCompanyId' : service.userDetails?.parentCompanyId, 'companyId' : service.userDetails?.companyId, 'imageName' : 'logo'});
    
   }

  ngOnInit(): void {

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.menuList  = JSON.parse(this.service.session({ "method": "get", "key": "MenuList" }));  

    var url = this.router.url.split('/');

    url.splice(0,1);

    this.selectMenuChanges(url);

    this.router.events.subscribe(e=>{

      if(e instanceof NavigationEnd) {

        let url = e.url.split('/');

        url.splice(0,1);
        
        this.selectMenuChanges(url);

      }

    })

  }

  logImgErrorHandling(){ this.logoUrl = './assets/images/pest_logo_new.png'; }

  selectMenuChanges(url: any) {    

    this.menuList = _.map(this.menuList,(menuDet: any)=>{

      menuDet['isExpand'] = menuDet.url == url[0];

      menuDet['isSelected'] = menuDet.url == url[0];

      menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

        subMenuOneDet['isExpand'] = subMenuOneDet.url == url[0] + '/' + url[1];

        subMenuOneDet['isSelected'] = subMenuOneDet.url == url[0] + '/' + url[1];

        subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

          subMenuTwoDet['isExpand'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];

          subMenuTwoDet['isSelected'] = subMenuTwoDet.url == url[0] + '/' + url[1] + '/' + url[2];

          return subMenuTwoDet;

        });

        return subMenuOneDet;

      })

      return menuDet;

    });

  }

  openMenu({ path = "", menuLevel = 0 }: { path?: String, menuLevel?: number }) {

    this.isMenuOpen = true;

     this.menuEvent.emit(this.isMenuOpen);

     let url = path.split('/');     
     
     let menu = url[0];

     let subMenuOne = url[0] + '/' + url[1];

     let subMenuTwo = url[0] + '/' + url[1] + '/' + url[2];

     this.menuList = _.map(this.menuList,(menuDet: any)=>{

      menuDet['isExpand'] = menuDet.url == menu && menuLevel == 0 ? !menuDet['isExpand'] : menuDet.url != menu ? false : menuDet['isExpand'];

      menuDet['subMenu'] = _.map(menuDet.subMenu,(subMenuOneDet: any)=>{

        subMenuOneDet['isExpand'] = subMenuOneDet.url == subMenuOne && menuLevel == 1 ? !subMenuOneDet['isExpand'] : subMenuOneDet.url != subMenuOne ? false : subMenuOneDet['isExpand'];

          subMenuOneDet['subMenu'] = _.map(subMenuOneDet.subMenu,(subMenuTwoDet: any)=>{

            subMenuTwoDet['isExpand'] = subMenuTwoDet.url == subMenuTwo && menuLevel == 2 ? !subMenuTwoDet['isExpand'] : subMenuTwoDet.url != subMenuTwo ? false : subMenuTwoDet['isExpand'] ;
  
            return subMenuTwoDet;
  
          });

        return subMenuOneDet;

      });

      return menuDet;

    });   

  }

}
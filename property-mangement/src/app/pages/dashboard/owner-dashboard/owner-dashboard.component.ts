import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexLegend, ApexNonAxisChartSeries, NgApexchartsModule, ChartComponent, ApexStroke, ApexFill, ApexMarkers } from 'ng-apexcharts';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export type outstandingChartOptions = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };

export type unitChartOptions = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type rentOverdueChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type DonutChartOptions = { series: ApexNonAxisChartSeries; chart: ApexChart; labels: string[]; responsive: ApexResponsive[]; legend?: ApexLegend; };

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent {
  
  @ViewChild('openTicketAgeingModal') openTicketAgeingModal!: TemplateRef<any>;
  
  @ViewChild('openOverviewExpandModal') openOverviewExpandModal!: TemplateRef<any>;

  @ViewChild("chart") chart!: ChartComponent;

  public unitChartOptions!: Partial<unitChartOptions> | any;

  public outstandingChartOptions!: Partial<outstandingChartOptions> | any;

  public rentOverdueChartOption!: Partial<rentOverdueChartOption> | any;

  constructor(public service: CommonService, private fb: FormBuilder, private modalService: NgbModal) {

    this.unitChartOptions = {

      chart: { type: "donut", height: 350 },

      labels: [ "Occupied Unit", "Vacant Unit" ],

      series: [ '' ],
      
      colors: [ '#2C5069', '#D2A119' ],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center',

        floating: false, fontSize: '14px', fontFamily: '"Poppins", serif',

        height: '50px', markers: { width: 10, height: 10, shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        itemMargin: { horizontal: 12, vertical: 10 } 

      },
      
      dataLabels: { enabled: false },

      tooltip: {

        enabled: true,

        custom: function({series, seriesIndex, dataPointIndex, w}: any) {

          return `<span class="bg-white text-dark text-center px-2">${w.globals.labels[seriesIndex]}<br> ${w.globals.series[seriesIndex]}</span>`

        }

      },

      plotOptions: {

        pie: {

          donut: {

            size: '70%',

            labels: { show: true,

              name: { show: true, color: "#00000080" },

              value:{ offsetY: -2, color:'#000000', fontSize: '20px', fontWeight: '700' },

              total: { show: true, showAlways: true, label: 'Total Units', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif' }

            }

          }

        }

      },   

      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } } ]

    };

    this.outstandingChartOptions = {

      chart: { type: "donut", height: 350 },

      labels: [ "Occupied Unit", "Vacant Unit" ],

      series: [ '' ],
      
      colors: [ '#2C5069', '#D2A119' ],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center',

        floating: false, fontSize: '14px', fontFamily: '"Poppins", serif',

        height: '50px', markers: { width: 10, height: 10, shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        itemMargin: { horizontal: 12, vertical: 10 } 

      },
      
      dataLabels: { enabled: false },

      tooltip: {

        enabled: true,

        custom: function({series, seriesIndex, dataPointIndex, w}: any) {

          return `<span class="bg-white text-dark text-center px-2">${w.globals.labels[seriesIndex]}<br> ${w.globals.series[seriesIndex]}</span>`

        }

      },

      plotOptions: {

        pie: {

          donut: {

            size: '70%',

            labels: { show: true,

              name: { show: true, color: "#00000080" },

              value:{ offsetY: -2, color:'#000000', fontSize: '20px', fontWeight: '700' },

              total: { show: true, showAlways: true, label: 'Total Units', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif' }

            }

          }

        }

      },   

      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } } ]

    };

    this.rentOverdueChartOption = {

      chart: { type: "donut" },

      labels: [ '< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month' ],

      series: [ 20000, 12000, 5000, 8000 ],

      colors: [ '#2C5069', '#41769B', '#D2A119', '#E6B62F' ],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center', floating: false,

        fontSize: '16px', fontFamily: '"Poppins", serif', 
        
        height: '50px', markers: { shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        itemMargin: { horizontal: 12, vertical: 10 } 

      },

      dataLabels: { enabled: false },

      tooltip: {

        enabled: true,

        custom: function({series, seriesIndex, dataPointIndex, w}: any) {

          return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br> ${w.globals.series[seriesIndex]}</span>`

        }

      },

      plotOptions: {

        pie: {

          donut: {

            size: '70%',

            labels: { show: true, name: { show: true, color: "#00000080" },

              value:{ offsetY: -2, color:'#000000', fontSize: '20px', fontWeight: '700' },

              total: { show: true, showAlways: true, label: 'Total Rent Overdue', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif' }

            }

          }

        }

      }, 

      responsive: [{ breakpoint: 1440, options: { chart: { width: 300 }, legend: { position: "bottom" } } }]

    };

  }

  unitDetailsChart!: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    legend: ApexLegend;
  };

  rentUnitDetailChart!: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    legend: ApexLegend;
  };

  propertyOrUnitList: any = [
    { value: 'property', label: 'Property' },
    { value: 'unit', label: 'Unit' },
  ];

  rentTrendChart!: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    colors: string[];
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    stroke: ApexStroke;
    fill: ApexFill;
    dropShadow: ApexDropShadow;
    markers: ApexMarkers
  }
  
  newRentTrendChart!: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    colors: string[];
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    stroke: ApexStroke;
    fill: ApexFill;
    dropShadow: ApexDropShadow;
    markers: ApexMarkers;
  } | null;

  utilityTrendChart!: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    colors: string[];
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    stroke: ApexStroke;
    fill: ApexFill;
    dropShadow: ApexDropShadow;
    markers: ApexMarkers
  };

  selectedAgeingType = 'manager';
  isStaffView = false;
  masterList: any = {};
  permissions: any = {}
  userDetails: any = {};
  _: any = _;
  filterForm: FormGroup = new FormGroup({});

  selectedManagerStaffList: any[] = [];
  selectedStaffManager: any = null;
  viewType: 'manager' | 'staff' = 'manager'; 

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  topStats: any[] = [];
  ticketAgeing: any = [];
  limitedOverviewList: any[] = [];

  selectedRentDuration = '1month';
  selectedUtilityDuration = '1month';
  rentCurrentOffset: number = 0; 
  utilityCurrentOffset: number = 0;
  monthsPerPage: number = 6;

  selectedNewRentDuration: 'daily' | 'weekly' | 'monthly' = 'daily';
  newRentCurrentOffset: number = 0;
  isLoading: boolean = false;
  currentStartDate: string = '';
  currentEndDate: string = '';
  currentWeekNumbers: any;
  currentWeekYear: any;
  currentMonthNumbers: any;
  currentMonthYear: any;
  canNavigateNext: boolean = true;
  canNavigatePrev: boolean = true;
  daysPerPage: number = 7; // 7 days
  weeksPerPage: number = 4; // 4 weeks
  // monthsPerPage: number = 6; // 6 months
  totalPaid: number = 0;
  totalOutstanding: number = 0;

  rentNavigateNext: boolean = true;
  rentNavigatePrev: boolean = false;
  utilityNavigateNext: boolean = true;
  utilityNavigatePrev: boolean = false;

  selectedData: any = {};

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Owner Dashboard"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});
                  
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getAllDetails();

    this.dashBoardform();

    this.initUnitDetailsChart();

    this.initRentOverdueChart();

    this.initOutstandingChart();

    this.getOutstandingAgeingList();

    this.getOpenTicketAgeingList();

    this.getRentCollectionList(this.selectedRentDuration);

    this.getUtilityCollectionList(this.selectedUtilityDuration);

    this.getOutstandingChartList();

    this.getRentOverdueChartList();

    this.getOverviewList();

    let referenceDate = new Date(); // IST

    this.currentEndDate = this.formatDate(referenceDate);
    
    this.currentStartDate = this.formatDate(new Date(referenceDate.getTime() - 6 * 24 * 60 * 60 * 1000)); // Last 7 days
    
    this.currentWeekYear = referenceDate.getFullYear();
    
    this.currentWeekNumbers = this.getCurrentWeekNumbers(referenceDate);
    
    this.currentMonthYear = referenceDate.getFullYear();
    
    this.currentMonthNumbers = this.getCurrentMonthNumbers(referenceDate);

    this.getNewRentCollectionList(this.selectedNewRentDuration);

  }

  isSelected(id: string, controlName: string): boolean {

    let selected = this.filterForm.get(controlName)?.value || [];
    
    return selected.includes(id);
  
  }

  getAllDetails() {

    if (_.size(this.masterList['companyList']) > 1) {

      this.companyId = _.map(this.masterList['companyList'], 'companyId');

    } else {

      this.companyId = this.companyId;

    }

    forkJoin({

      'propertyList': this.service.postService({ 

        "url": "/property/list", 

        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'owner' ? {'propertyIds': this.userDetails.propertyIds} : {}) },

        'loaderState': true
      
      }),
      
      'unitList': this.service.postService({ 
      
        "url": "/unit/list", 
      
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails?.userType == 'owner' ? {'propertyIds': this.userDetails?.propertyIds} : {}) },
      
        'loaderState': true
      
      }),
      
      'managerList': this.service.postService({ 
      
        "url": "/otherUser/list", 
      
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, 'userType': 'manager', 'propertyIds': this.userDetails.propertyIds },
        
        'loaderState': true
      
      }),
      
      'staffList': this.service.postService({ 
      
        "url": "/otherUser/list", 
      
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true, 'userType': 'staff', 'propertyName': this.userDetails.propertyIds },
      
        'loaderState': true
      
      }),
      
      'utilityList': this.service.postService({ 
      
        "url": "/master/utility/list", 
      
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
      
        'loaderState': true
      
      }),
      
      'countList': this.service.postService({ 
      
        "url": "/dashboard/count", 
      
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'owner' ? {'property': this.userDetails.propertyIds} : {}) },
        
        'loaderState': true
      
      }),
    
    }).subscribe({
    
      next: (res: any) => {
    
        if (res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];
    
        if (res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];
    
        if (res.managerList?.status == 'ok') this.masterList['managerList'] = res.managerList.data || [];
    
        if (res.staffList?.status == 'ok') this.masterList['staffList'] = res.staffList.data || [];
    
        if (res.utilityList?.status == 'ok') this.masterList['utilityList'] = res.utilityList.data || [];

        if (res?.countList) {
    
          this.masterList['countList'] = res.countList;

          this.topStats = [
    
            { label: 'Total Property', count: this.masterList['countList'].totalProperty || 0, icon: 'images/building-dashboard.png' },

            { 

              label: 'Occupied / Vacant Unit Count', 
              
              count: `${this.masterList['countList'].totalOccupiedUnits || 0} / ${this.masterList['countList'].totalNonOccupiedUnits || 0}`, 
              
              icon: 'images/occupied.png' 
  
            },

            { 

              label: 'Rent Collected / Outstanding Till Date', 
              
              count: `${this.service.currencyCode?.currencyCode}. ${this.formatValue(this.masterList['countList'].totalRentCollected || 0)} / ${this.service.currencyCode?.currencyCode}. ${this.formatValue(this.masterList['countList'].totalRentOverdue || 0)}`, 
              
              icon: 'images/rent-collected.png' 
  
            },
    
            { label: 'Total Open Tickets', count: this.masterList['countList'].totalOpenTickets || 0, icon: 'images/open-tickets.png' },
    
            { label: 'Total Utilities Overdue', count: this.masterList['countList'].totalUtilitiesOverdue || 0, icon: 'images/utltility-overDue.png' }
    
          ];
          
          let occupied = this.masterList['countList'].totalOccupiedUnits || 0;
          
          let vacant = this.masterList['countList'].totalNonOccupiedUnits || 0;
          
          this.unitChartOptions.series = [occupied, vacant];
        
        }

      }
    
    });

  }

  formatValue(value: number, currencyCode?: string): string {
 
    if (value >= 1000000) {
 
      return (value / 1000000)?.toFixed(1) + 'M';
 
    } else if (value >= 1000) {
 
      return (value / 1000)?.toFixed(1) + 'k';
 
    } else {
 
      return value?.toString();
 
    }
 
  }

  dashBoardform() {

    this.filterForm = this.fb.group({

      'outsPropertyOrUnit': [false],

      'outsProperty': null,

      'outsUnit': null,

      'managerOrStaff': [false],

      'managerName': null,

      'staffName': null,

      'rentPropertyOrUnit': [false],

      'rentPropertyName': null,

      'rentUnitName': null,

      'newRentPropertyOrUnit': [false],

      'newRentPropertyName': null,

      'newRentUnitName': null,

      'utilityProperty': [false],

      'utilityPropertyName': null,

      'utilityName': null,

      'rentOverduePropertyName': null,

      'overviewPay': 'propertyTaxPayHistory'

    });

    this.changeValue({});

  }

  get f(): any { return this.filterForm.controls; }

  getOpenTicketAgeingList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(this.filterForm.get('managerOrStaff')?.value == false) {

      payload['ageingType'] = 'manager';

      if(!_.isEmpty(this.filterForm.get('managerName')?.value)) {

        payload['manager'] = this.filterForm.get('managerName')?.value

      }

    } else {

      payload['ageingType'] = 'staff';

      if(!_.isEmpty(this.filterForm.get('staffName')?.value)) {

        payload['staff'] = this.filterForm.get('staffName')?.value

      }

    }

    this.service.postService({ url: '/dashboard/openTicketAgeingOwner', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['ticketAgeingManagerList'] = res.managerList || [];

        this.masterList['ticketAgeingStaffList'] = res.staffList || [];

      }

    });
    
  }







  // New Rent Collection Trend
  // getNewRentCollectionList(duration: 'daily' | 'weekly' | 'monthly' = 'daily'): void {

  //   this.selectedNewRentDuration = duration;
    
  //   this.newRentCurrentOffset = 0;
    
  //   this.isLoading = true;
    
  //   this.totalPaid = 0;
    
  //   this.totalOutstanding = 0;

  //   let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'billType': 'rent' };

  //   if (this.filterForm.get('newRentPropertyOrUnit')?.value == false) {

  //     payload['type'] = 'property';

  //     if (!_.isEmpty(this.filterForm.get('newRentPropertyName')?.value)) {

  //       payload['propertyId'] = this.filterForm.get('newRentPropertyName')?.value;

  //     }

  //   } else {

  //     payload['type'] = 'unit';

  //     if (!_.isEmpty(this.filterForm.get('newRentUnitName')?.value)) {

  //       payload['unitId'] = this.filterForm.get('newRentUnitName')?.value;

  //     }

  //   }

  //   let params: any = {};

  //   let currentDate = new Date();

  //   if (duration == 'daily') {

  //     params['frequency'] = 'daily';

  //     payload['startDate'] = this.currentStartDate.split('T')[0] + 'T00:00:00Z';

  //     payload['endDate'] = this.currentEndDate.split('T')[0] + 'T23:59:59Z';

  //   } else if (duration == 'weekly') {
      
  //     params['frequency'] = 'weekly';

  //     payload['weekNumbers'] = this.currentWeekNumbers;

  //     payload['weekYear'] = this.currentWeekYear;

  //   } else if (duration == 'monthly') {

  //     params['frequency'] = 'monthly';

  //     payload['monthNumber'] = this.currentMonthNumbers;

  //     payload['monthYear'] = this.currentMonthYear;

  //   }

  //   this.service.postService({ url: '/dashboard/collection/rent', payload, params }).subscribe((res: any) => {

  //     this.isLoading = false;

  //     if (res.status == 'ok') {

  //       let list: any[] = [];

  //       let allData = res.data || [];

  //       if (duration == 'daily') {

  //         let start = new Date(this.currentStartDate);

  //         let end = new Date(this.currentEndDate);

  //         for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

  //           let dateStr = this.formatDate(new Date(d)).split('T')[0] + 'T00:00:00Z';
            
  //           let dataPoint = allData.find((item: any) => {

  //             let itemDate = new Date(item.paymentDate)?.toISOString().split('T')[0];

  //             return itemDate == dateStr.split('T')[0];

  //           });

  //           let paid = dataPoint ? dataPoint.amount : 0;

  //           let outstanding = dataPoint ? dataPoint.outstanding : 0;

  //           list.push({
              
  //             date: this.formatDateForDisplay(new Date(d)),

  //             total_paid: paid,

  //             total_outstanding: outstanding,

  //             count: dataPoint ? 1 : 0,

  //           });

  //         }

  //       } else if (duration == 'weekly') {

  //         list = this.currentWeekNumbers.map((week: number) => {

  //           let startDate = this.getWeekStartDate(week, this.currentWeekYear);

  //           let endDate = this.getWeekEndDate(week, this.currentWeekYear);

  //           let dataPoint = allData.find((item: any) => item.weekNumber == week && item.weekYear == this.currentWeekYear);

  //           let paid = dataPoint ? dataPoint.amount : 0;

  //           let outstanding = dataPoint ? dataPoint.outstanding : 0;

  //           return {

  //             date: `${startDate.getDate().toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}-${endDate.toLocaleString('default', { month: 'short' })}-${endDate.getFullYear().toString().slice(2)}`,

  //             // date: `${this.formatDateForDisplay(startDate)} to ${this.formatDateForDisplay(endDate)}`,

  //             total_paid: paid,

  //             total_outstanding: outstanding,

  //             count: dataPoint ? 1 : 0,

  //             weekNumber: week,

  //           };

  //         });

  //       } else if (duration == 'monthly') {

  //         list = this.currentMonthNumbers.map((month: number) => {

  //           let dataPoint = allData.find((item: any) => item.monthNumber == month && item.monthYear == this.currentMonthYear);

  //           let paid = dataPoint ? dataPoint.amount : 0;

  //           let outstanding = dataPoint ? dataPoint.outstanding : 0;
            
  //           return {

  //             date: `${(month >= 1 && month <= 12) ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] : 'Invalid'} ${this.currentMonthYear}`,

  //             // date: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]} ${this.currentMonthYear}`,

  //             // date: `Month ${month} ${this.currentMonthYear}`,

  //             total_paid: paid,

  //             total_outstanding: outstanding,

  //             count: dataPoint ? 1 : 0,

  //             monthNumber: month,

  //           };

  //         });
        
  //       }

  //       this.totalPaid = _.sumBy(list, 'total_paid');

  //       this.totalOutstanding = _.sumBy(list, 'total_outstanding');

  //       this.masterList['newRentCollectionList'] = list;

  //       let categories = _.map(list, 'date');

  //       let paidData = _.map(list, 'total_paid');

  //       let outstandingData = _.map(list, 'total_outstanding');

  //       let periodsPerPage = duration == 'monthly' ? this.monthsPerPage : duration == 'daily' ? this.daysPerPage : this.weeksPerPage;

  //       let totalPeriods = categories.length;

  //       let startIdx = this.newRentCurrentOffset;

  //       let endIdx = Math.min(startIdx + periodsPerPage, totalPeriods);

  //       categories = categories.slice(startIdx, endIdx);

  //       paidData = paidData.slice(startIdx, endIdx);

  //       outstandingData = outstandingData.slice(startIdx, endIdx);

  //       this.canNavigatePrev = startIdx > 0 || this.canFetchPrevious(duration, currentDate);

  //       this.canNavigateNext = endIdx < totalPeriods || this.canFetchNext(duration, currentDate);

  //       this.initNewRentTrendChart(categories, paidData, outstandingData);

  //     } else {

  //       this.canNavigateNext = this.canFetchNext(duration, currentDate);

  //       this.canNavigatePrev = this.canFetchPrevious(duration, currentDate);

  //       this.newRentTrendChart = null;

  //       this.masterList['newRentCollectionList'] = [];

  //       this.totalPaid = 0;

  //       this.totalOutstanding = 0;

  //     }

  //   });

  // }

  getNewRentCollectionList(duration: 'daily' | 'weekly' | 'monthly' = 'daily') {

    this.selectedNewRentDuration = duration;

    this.newRentCurrentOffset = 0;

    this.isLoading = true;

    this.totalPaid = 0;

    this.totalOutstanding = 0;

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'billType': 'rent' };

    if (this.filterForm.get('newRentPropertyOrUnit')?.value == false) {

      payload['type'] = 'property';

      if (!_.isEmpty(this.filterForm.get('newRentPropertyName')?.value)) {

        payload['propertyId'] = this.filterForm.get('newRentPropertyName')?.value;

      }

    } else {

      payload['type'] = 'unit';

      if (!_.isEmpty(this.filterForm.get('newRentUnitName')?.value)) {

        payload['unitId'] = this.filterForm.get('newRentUnitName')?.value;

      }

    }

    let params: any = {};

    let currentDate = new Date();

    if (duration == 'daily') {

      params['frequency'] = 'daily';

      payload['startDate'] = this.currentStartDate.split('T')[0] + 'T00:00:00Z';

      payload['endDate'] = this.currentEndDate.split('T')[0] + 'T23:59:59Z';

    } else if (duration == 'weekly') {

      params['frequency'] = 'weekly';

      payload['weekNumbers'] = this.currentWeekNumbers;

      payload['weekYear'] = this.currentWeekYear;

    } else if (duration == 'monthly') {

      params['frequency'] = 'monthly';

      payload['monthNumber'] = this.currentMonthNumbers;

      payload['monthYear'] = this.currentMonthYear;

    }

    this.service.postService({ url: '/dashboard/collection/rent', payload, params }).subscribe(

      (res: any) => {

        this.isLoading = false;

        if (res.status == 'ok') {

          let list: any[] = [];

          let allData = res.data || [];

          if (duration == 'daily') {

            let start = new Date(this.currentStartDate);

            let end = new Date(this.currentEndDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

              let dateStr = this.formatDate(new Date(d)).split('T')[0] + 'T00:00:00Z';

              let dataPoint = allData.find((item: any) => {

                if (!item.date || typeof item.date != 'string') {

                  return false;

                }

                try {

                  let itemDate = new Date(item.date);

                  if (isNaN(itemDate.getTime())) { return false; }

                  return itemDate.toISOString().split('T')[0] == dateStr.split('T')[0];

                } catch (error) {


                  return false;

                }

              });

              let paid = dataPoint ? dataPoint.amountPaid : 0;

              let outstanding = dataPoint ? dataPoint.outstanding : 0;

              list.push({

                date: this.formatDateForDisplay(new Date(d)),

                total_paid: paid,

                total_outstanding: outstanding,

                count: dataPoint ? 1 : 0,

              });

            }

          } else if (duration == 'weekly') {

            list = this.currentWeekNumbers.map((week: number) => {

              let startDate = this.getWeekStartDate(week, this.currentWeekYear);

              let endDate = this.getWeekEndDate(week, this.currentWeekYear);

              let dataPoint = allData.find(

                (item: any) => item.weekNumber == week && item.weekYear == this.currentWeekYear

              );

              let paid = dataPoint ? dataPoint.amountPaid : 0;

              let outstanding = dataPoint ? dataPoint.outstanding : 0;

              return {

                date: `${startDate.getDate().toString().padStart(2, '0')}-${endDate.getDate().toString()

                  .padStart(2, '0')}-${endDate.toLocaleString('default', { month: 'short' })}-${endDate.getFullYear().toString().slice(2)}`,

                    total_paid: paid,

                    total_outstanding: outstanding,

                    count: dataPoint ? 1 : 0,

                    weekNumber: week,

                  };

                });

              } else if (duration == 'monthly') {

                list = this.currentMonthNumbers.map((month: number) => {

                  let dataPoint = allData.find(

                    (item: any) => item.month == month && item.monthYear == this.currentMonthYear

                  );

                  let paid = dataPoint ? dataPoint.amountPaid : 0;

                  let outstanding = dataPoint ? dataPoint.outstanding : 0;

                return {
    
                  date: `${month >= 1 && month <= 12 ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] : 'Invalid'} ${
    
                    this.currentMonthYear
    
                  }`,
    
                  total_paid: paid,
    
                  total_outstanding: outstanding,
    
                  count: dataPoint ? 1 : 0,
    
                  monthNumber: month,
    
                };
  
            });
  
          }

          this.totalPaid = _.sumBy(list, 'total_paid');
          
          this.totalOutstanding = _.sumBy(list, 'total_outstanding');
          
          this.masterList['newRentCollectionList'] = list;

          let categories = _.map(list, 'date');
          
          let paidData = _.map(list, 'total_paid');
          
          let outstandingData = _.map(list, 'total_outstanding');

          let periodsPerPage = duration == 'monthly' ? this.monthsPerPage : duration == 'daily' ? this.daysPerPage : this.weeksPerPage;

          let totalPeriods = categories.length;

          let startIdx = this.newRentCurrentOffset;

          let endIdx = Math.min(startIdx + periodsPerPage, totalPeriods);

          categories = categories.slice(startIdx, endIdx);

          paidData = paidData.slice(startIdx, endIdx);

          outstandingData = outstandingData.slice(startIdx, endIdx);

          this.canNavigatePrev = startIdx > 0 || this.canFetchPrevious(duration, currentDate);

          this.canNavigateNext = endIdx < totalPeriods || this.canFetchNext(duration, currentDate);

          this.initNewRentTrendChart(categories, paidData, outstandingData);

        } else {

          this.canNavigateNext = this.canFetchNext(duration, currentDate);

          this.canNavigatePrev = this.canFetchPrevious(duration, currentDate);

          this.newRentTrendChart = null;

          this.masterList['newRentCollectionList'] = [];

          this.totalPaid = 0;

          this.totalOutstanding = 0;

        }

      }
    
    );
    
  }

  initNewRentTrendChart(categories: string[], paidData: number[], outstandingData: number[]): void {
    
    let currencyCode = this.service.currencyCode?.currencyCode || 'INR';

    this.newRentTrendChart = {
    
      series: [ { name: 'Paid', data: paidData, type: 'area' }, { name: 'Outstanding', data: outstandingData, type: 'area' } ],
    
      chart: { type: 'area', height: 300, stacked: false, toolbar: { show: true, tools: { zoom: false, zoomin: false, zoomout: false, download: false, selection: false, pan: false, reset: false } } },
      
      plotOptions: { area: { fillTo: 'end' } },
      
      stroke: { curve: 'smooth', width: 3 },
      
      fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.0, stops: [2, 60] } },
      
      dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.2 },
      
      dataLabels: { enabled: true, formatter: (val: number) => `${this.formatValue(val, currencyCode)}`, 
      
      style: { colors: ['#000000'], fontSize: '11px', fontWeight: '500' }, background: { enabled: false, foreColor: '#000000', 
        
        padding: 4, borderRadius: 4, borderWidth: 1, borderColor: '#2C5069', opacity: 0.9 },
  
        offsetY: -5, 
      
      },
  
      // markers: { size: 5, colors: ['#2C5069', '#F2B200'], strokeWidth: 2, strokeColors: '#ffffff', hover: { size: 7 }, shape: 'square' },
      
      markers: { size: 5, colors: ['#2C5069', '#F2B200'], strokeWidth: 2, strokeColors: '#ffffff', hover: { size: 7 } },
      
      xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },
      
      yaxis: { labels: { formatter: (val: number) => `${this.formatValue(val, currencyCode)}`, style: { fontWeight: 600 } } },
      
      colors: ['#2C5069', '#F2B200'],
      
      legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 },
    
    };
  
  }

  navigatePrev() {

    if (this.selectedNewRentDuration == 'daily') {
    
      let endDate = new Date(this.currentStartDate);
    
      endDate.setDate(endDate.getDate() - 1);
    
      this.currentEndDate = this.formatDate(endDate);
    
      this.currentStartDate = this.formatDate(new Date(endDate.getTime() - (this.daysPerPage - 1) * 24 * 60 * 60 * 1000));
    
    } else if (this.selectedNewRentDuration == 'weekly') {
    
      let firstWeek = this.currentWeekNumbers[0] - this.weeksPerPage;
    
      if (firstWeek < 1) {
    
        this.currentWeekYear--;
    
        this.currentWeekNumbers = Array.from({ length: this.weeksPerPage }, (_, i) => firstWeek + i + 52);
    
      } else {
    
        this.currentWeekNumbers = Array.from({ length: this.weeksPerPage }, (_, i) => firstWeek + i);
    
      }
    
    } else if (this.selectedNewRentDuration == 'monthly') {
    
      let firstMonth = this.currentMonthNumbers[0] - this.monthsPerPage;
    
      if (firstMonth < 1) {
    
        this.currentMonthYear--;
    
        this.currentMonthNumbers = Array.from({ length: this.monthsPerPage }, (_, i) => firstMonth + i + 12);
    
      } else {
    
        this.currentMonthNumbers = Array.from({ length: this.monthsPerPage }, (_, i) => firstMonth + i);
    
      }
    
    }
    
    this.newRentCurrentOffset = 0;
    
    this.getNewRentCollectionList(this.selectedNewRentDuration);
  
  }

  navigateNext() {

    if (this.selectedNewRentDuration == 'daily') {
    
      let startDate = new Date(this.currentEndDate);
    
      startDate.setDate(startDate.getDate() + 1);
    
      this.currentStartDate = this.formatDate(startDate);
    
      this.currentEndDate = this.formatDate(new Date(startDate.getTime() + (this.daysPerPage - 1) * 24 * 60 * 60 * 1000));
    
    } else if (this.selectedNewRentDuration == 'weekly') {
    
      let firstWeek = this.currentWeekNumbers[this.currentWeekNumbers.length - 1] + 1;
    
      if (firstWeek > 52) {
    
        this.currentWeekYear++;
    
        this.currentWeekNumbers = Array.from({ length: this.weeksPerPage }, (_, i) => firstWeek + i - 52);
    
      } else {
    
        this.currentWeekNumbers = Array.from({ length: this.weeksPerPage }, (_, i) => firstWeek + i);
    
      }
    
    } else if (this.selectedNewRentDuration == 'monthly') {
    
      let firstMonth = this.currentMonthNumbers[this.currentMonthNumbers.length - 1] + 1;
    
      if (firstMonth > 12) {
    
        this.currentMonthYear++;
    
        this.currentMonthNumbers = Array.from({ length: this.monthsPerPage }, (_, i) => firstMonth + i - 12);
    
      } else {
    
        this.currentMonthNumbers = Array.from({ length: this.monthsPerPage }, (_, i) => firstMonth + i);
    
      }
    
    }
    
    this.newRentCurrentOffset = 0;
    
    this.getNewRentCollectionList(this.selectedNewRentDuration);
  
  }

  canFetchPrevious(duration: string, currentDate: Date): boolean {
    if (duration == 'daily') {
      let startDate = new Date(this.currentStartDate);
      return startDate > new Date('1970-01-01');
    } else if (duration == 'weekly') {
      return this.currentWeekYear > 1970 || this.currentWeekNumbers[0] > 1;
    } else if (duration == 'monthly') {
      return this.currentMonthYear > 1970 || this.currentMonthNumbers[0] > 1;
    }
    return true;
  }

  canFetchNext(duration: string, currentDate: Date): boolean {
 
    if (duration == 'daily') {
 
      let endDate = new Date(this.currentEndDate);
 
      return endDate < currentDate;
 
    } else if (duration == 'weekly') {
 
      let lastWeek = this.currentWeekNumbers[this.currentWeekNumbers.length - 1];
 
      let currentWeek = this.getWeekNumber(currentDate);
 
      let currentYear = currentDate.getUTCFullYear();
 
      return this.currentWeekYear < currentYear || (this.currentWeekYear == currentYear && lastWeek < currentWeek);
 
    } else if (duration == 'monthly') {
 
      let lastMonth = this.currentMonthNumbers[this.currentMonthNumbers.length - 1];
 
      let currentMonth = currentDate.getUTCMonth() + 1;
 
      let currentYear = currentDate.getUTCFullYear();
 
      return this.currentMonthYear < currentYear || (this.currentMonthYear == currentYear && lastMonth < currentMonth);
 
    }
 
    return false;
 
  }

  formatDate(date: Date): string {
 
    return date.toISOString().split('.')[0] + 'Z';
 
  }

  formatDateForDisplay(date: Date): string {
  
    let year = date.getUTCFullYear();
  
    let month = String(date.getUTCMonth() + 1).padStart(2, '0');
  
    let day = String(date.getUTCDate()).padStart(2, '0');
  
    return `${day}-${month}-${year}`;
  
  }

  getWeekStartDate(week: number, year: number): Date {
  
    let janFirst = new Date(Date.UTC(year, 0, 1));
  
    let days = (week - 1) * 7 - janFirst.getUTCDay() + 1;
  
    let startDate = new Date(Date.UTC(year, 0, 1 + days));
  
    return startDate;
  
  }

  getWeekEndDate(week: number, year: number): Date {
    
    let startDate = this.getWeekStartDate(week, year);

    let endDate = new Date(startDate);

    endDate.setDate(startDate.getUTCDate() + 6);

    return endDate;

  }

  getWeekNumber(date: Date): number {
    
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    let dayNum = d.getUTCDay() || 7;
 
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
 
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
 
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
 
  }

  getCurrentWeekNumbers(referenceDate: Date): number[] {
 
    let weekNumber = this.getWeekNumber(referenceDate);
 
    let weeks: number[] = [];
 
    for (let i = 0; i < this.weeksPerPage; i++) {
 
      let week = weekNumber - i;
 
      if (week < 1) {
 
        week += 52;
 
      }
 
      weeks.unshift(week);
 
    }
 
    return weeks;
 
  }

  getCurrentMonthNumbers(referenceDate: Date): number[] {
 
    let currentMonth = referenceDate.getMonth() + 1;
 
    let months: number[] = [];
 
    for (let i = 0; i < this.monthsPerPage; i++) {
 
      let month = currentMonth - i;
 
      if (month < 1) {
 
        month += 12;
 
      }
 
      months.unshift(month);
 
    }
 
    return months;
 
  }




  // Rent Collection Trend Chat
  getRentCollectionList(duration?: any): void {

    this.selectedRentDuration = duration;

    let payload: any = {  'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId,  'property': this.userDetails.propertyIds, 'dateRange': duration };

    if(this.filterForm.get('rentPropertyOrUnit')?.value == false) {

      payload['type'] = 'property';

      if(!_.isEmpty(this.filterForm.get('rentPropertyName')?.value)) {

        payload['property'] = this.filterForm.get('rentPropertyName')?.value;

      }

    } else {

      payload['type'] = 'unit';

      if(!_.isEmpty(this.filterForm.get('rentUnitName')?.value)) {

        payload['unit'] = this.filterForm.get('rentUnitName')?.value;

      }

    }

    this.service.postService({ url: '/dashboard/rentCollection', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        this.masterList['rentCollectionList'] = list;

        let categories = _.map(list, 'date');

        let paidData = _.map(list, 'total_paid');

        let outstandingData = _.map(list, 'total_outstanding');

        if (this.selectedRentDuration == '1year') {

          let totalMonths = categories.length;

          let startIdx = this.rentCurrentOffset;

          let endIdx = Math.min(startIdx + this.monthsPerPage, totalMonths);

          categories = categories.slice(startIdx, endIdx);

          paidData = paidData.slice(startIdx, endIdx);

          outstandingData = outstandingData.slice(startIdx, endIdx);

          this.rentNavigateNext = endIdx < totalMonths;

          this.rentNavigatePrev = startIdx > 0;

        }

        this.initRentTrendChart(categories, paidData, outstandingData);

      }

    });
    
  }

  initRentTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {
    
    let currencyCode = this.service.currencyCode?.currencyCode;

    this.rentTrendChart = {

      series: [

        { name: 'Paid', data: paidData, type: 'area' },

        { name: 'Outstanding', data: outstandingData, type: 'area' }

      ],

      chart: { type: 'area', height: 300, stacked: false, toolbar: { show: true, tools:{ zoom: false, zoomin: false, zoomout: false, download: false, selection: false, pan: false, reset: false, } }, },
      
      plotOptions: { area: { fillTo: 'origin' } },
      
      stroke: { curve: 'smooth', width: 3 },
      
      fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.0, stops: [2, 60] } },

      dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.2 },

      dataLabels: { enabled: true, formatter: (val: number) => `${this.formatValue(val)}`, 
      
      style: { colors: ['#000000'], fontSize: '11px', fontWeight: '500' }, 
      
      background: { enabled: false, foreColor: '#000000', padding: 4, borderRadius: 4, borderWidth: 1, borderColor: '#2C5069', opacity: 0.9, }, offsetY: -5 },

      markers: { size: 5, colors: ['#2C5069', '#F2B200'], strokeWidth: 2, strokeColors: '#ffffff', hover: { size: 7 } },

      xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

      yaxis: { labels: { formatter: (val: number) => `${this.formatValue(val)}`, style: { fontWeight: 600 } } },

      colors: ['#2C5069', '#F2B200'],

      legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

    };

  }

  rentNavigatePrevFun(): void {

    if (this.selectedRentDuration == '1year') {

      let totalMonths = this.masterList['rentCollectionList'].length;

      this.rentCurrentOffset -= this.monthsPerPage;

      if (this.rentCurrentOffset < 0) {

        this.rentCurrentOffset = 0;

      }
      this.updateRentCurrentData();

    }
    
  }

  rentNavigateNextFun(): void {

    if (this.selectedRentDuration == '1year') {

      let totalMonths = this.masterList['rentCollectionList'].length;

      this.rentCurrentOffset += this.monthsPerPage;

      if (this.rentCurrentOffset >= totalMonths) {

        this.rentCurrentOffset = totalMonths - this.monthsPerPage;


      }
      this.updateRentCurrentData();

    }
    
  }

  updateRentCurrentData(): void {

    let list = this.masterList['rentCollectionList'] || [];

    let categories = _.map(list, 'date');

    let paidData = _.map(list, 'total_paid');

    let outstandingData = _.map(list, 'total_outstanding');

    let totalMonths = categories.length;

    let startIdx = this.rentCurrentOffset;

    let endIdx = Math.min(startIdx + this.monthsPerPage, totalMonths);

    categories = categories.slice(startIdx, endIdx);

    paidData = paidData.slice(startIdx, endIdx);

    outstandingData = outstandingData.slice(startIdx, endIdx);

    this.rentNavigateNext = endIdx < totalMonths;

    this.rentNavigatePrev = startIdx > 0;

    this.initRentTrendChart(categories, paidData, outstandingData);

  }








  // Utility Collection Trend Chat
  getUtilityCollectionList(duration?: any): void {

    this.selectedUtilityDuration = duration;

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds, 'dateRange': duration };

    if(this.filterForm.get('utilityProperty')?.value == false) {

      payload['type'] = 'property';

      if(!_.isEmpty(this.filterForm.get('utilityPropertyName')?.value)) {

        payload['property'] = this.filterForm.get('utilityPropertyName')?.value

      }

    } else {

      payload['type'] = 'utility';

      if(!_.isEmpty(this.filterForm.get('utilityName')?.value)) {

        payload['utility'] = this.filterForm.get('utilityName')?.value

      }

    }

    this.service.postService({ url: '/dashboard/utilityCollection', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        this.masterList['utilityCollectionList'] = list;

        let categories = _.map(list, 'date');

        let paidData = _.map(list, 'total_paid');

        let outstandingData = _.map(list, 'total_outstanding');

        if (this.selectedUtilityDuration == '1year') {

          let totalMonths = categories.length;

          let startIdx = this.utilityCurrentOffset;

          let endIdx = Math.min(startIdx + this.monthsPerPage, totalMonths);

          categories = categories.slice(startIdx, endIdx);

          paidData = paidData.slice(startIdx, endIdx);

          outstandingData = outstandingData.slice(startIdx, endIdx);

          this.utilityNavigateNext = endIdx < totalMonths;

          this.utilityNavigatePrev = startIdx > 0;

        }

        this.initUtilityTrendChart(categories, paidData, outstandingData);

      }

    });

  }

  initUtilityTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {
    
    let currencyCode = this.service.currencyCode?.currencyCode;

    this.utilityTrendChart = {

      series: [

        { name: 'Paid', data: paidData, type: 'area' },

        { name: 'Outstanding', data: outstandingData, type: 'area' }

      ],

      chart: { type: 'area', height: 300, stacked: false, toolbar: { show: true, tools:{ zoom: false, zoomin: false, zoomout: false, download: false, selection: false, pan: false, reset: false, } }, },
      
      plotOptions: { area: { fillTo: 'origin' } },
      
      stroke: { curve: 'smooth', width: 3 },
      
      fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.0, stops: [2, 60] } },

      dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.2 },

      dataLabels: { enabled: true, formatter: (val: number) => `${this.formatValue(val)}`, 
      
      style: { colors: ['#000000'], fontSize: '11px', fontWeight: '500' }, 
      
      background: { enabled: false, foreColor: '#000000', padding: 4, borderRadius: 4, borderWidth: 1, borderColor: '#2C5069', opacity: 0.9, }, offsetY: -5 },

      markers: { size: 5, colors: ['#2C5069', '#F2B200'], strokeWidth: 2, strokeColors: '#ffffff', hover: { size: 7 } },

      xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

      yaxis: { labels: { formatter: (val: number) => `${this.formatValue(val)}`, style: { fontWeight: 600 } } },

      colors: ['#2C5069', '#F2B200'],

      legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

    };

  }

  // initUtilityTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {

  //   let currencyCode = this.service.currencyCode?.currencyCode;

  //   this.utilityTrendChart = {

  //     series: [ { name: 'Paid', data: paidData }, { name: 'Outstanding', data: outstandingData } ],

  //     chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },

  //     plotOptions: { bar: { horizontal: false, borderRadius: 2, columnWidth: '40%' } },

  //     dataLabels: { enabled: true, formatter: (val: number) => `${currencyCode}.${val.toLocaleString()}`, style: { colors: ['#1C1C1C'], fontSize: '11px', fontWeight: '500' } },

  //     xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

  //     yaxis: { labels: { formatter: (val: number) => `${currencyCode}.${val.toLocaleString()}`, style: { fontWeight: 600 } } },

  //     colors: ['#264E86', '#E6B93C'],

  //     legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

  //   };

  // }

  utilityNavigatePrevFun(): void {

    if (this.selectedUtilityDuration == '1year') {

      let totalMonths = this.masterList['utilityCollectionList'].length;

      this.utilityCurrentOffset -= this.monthsPerPage;

      if (this.utilityCurrentOffset < 0) {

        this.utilityCurrentOffset = 0;

      }
      
      this.updateUtilityCurrentData();

    }

  }

  utilityNavigateNextFun(): void {

    if (this.selectedUtilityDuration == '1year') {

      let totalMonths = this.masterList['utilityCollectionList'].length;

      this.utilityCurrentOffset += this.monthsPerPage;

      if (this.utilityCurrentOffset >= totalMonths) {

        this.utilityCurrentOffset = totalMonths - this.monthsPerPage;

      }

      this.updateUtilityCurrentData();

    }

  }

  updateUtilityCurrentData(): void {

    let list = this.masterList['utilityCollectionList'] || [];

    let categories = _.map(list, 'date');

    let paidData = _.map(list, 'total_paid');

    let outstandingData = _.map(list, 'total_outstanding');

    let totalMonths = categories.length;

    let startIdx = this.utilityCurrentOffset;

    let endIdx = Math.min(startIdx + this.monthsPerPage, totalMonths);

    categories = categories.slice(startIdx, endIdx);

    paidData = paidData.slice(startIdx, endIdx);

    outstandingData = outstandingData.slice(startIdx, endIdx);

    this.utilityNavigateNext = endIdx < totalMonths;

    this.utilityNavigatePrev = startIdx > 0;
    
    this.initUtilityTrendChart(categories, paidData, outstandingData); 

  }


  
  // Outstanding Chart list
  getOutstandingChartList() {

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    // if(!_.isEmpty(this.filterForm.get('rentOverduePropertyName')?.value)) {

    //   payload['property'] = this.filterForm.get('rentOverduePropertyName')?.value

    // }

    this.service.postService({ url: '/dashboard/outstanding', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        console.log('List Data', list);

        let allRanges = ['2 Weeks', '1 Month', '2 Month', '3 Month', '> 3 Month'];

        let colorMap: any = { '2 Weeks': '#2C5069', '1 Month': '#41769B', '2 Month': '#5284a8ff', '3 Month': '#D2A119', '> 3 Month': '#E6B62F'  };

        let dataGrouped = _.keyBy(list, 'range');

        let labels = allRanges;

        let series = _.map(allRanges, range => dataGrouped[range]?.totalOutstanding || 0);

        let colors = _.map(allRanges, range => colorMap[range]);

        this.outstandingChartOptions = { ...this.outstandingChartOptions, labels, series, colors }; 
      
      }

    });

  }

  initOutstandingChart() {

    let currencyCode = this.service?.currencyCode?.currencyCode;

    this.outstandingChartOptions = {

      chart: { type: "donut", height: 350 }, 
      
      labels: [], series: [], colors: [],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center', 
        
        floating: false, fontSize: '14px', fontFamily: '"Poppins", serif', 
        
        height: '50px',  width: 414, markers: { width: 10, height: 10, shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        // itemMargin: { horizontal: 12, vertical: 10 } 
      
      },

      dataLabels: { enabled: false },

      tooltip: { enabled: true,

        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {

          return `<span class="bg-white text-dark px-2"> ${w.globals.labels[seriesIndex]}<br>${currencyCode} ${w.globals.series[seriesIndex].toLocaleString()} </span>`;

        }

      },

      plotOptions: {

        pie: { donut: { size: '70%', labels: { 
          
          show: true, name: { show: true, color: "#00000080" },

          value: { offsetY: -2, color: '#000000', fontSize: '20', fontWeight: '700', formatter: (value: number) => `${currencyCode} ${value.toLocaleString()}` },

          total: { show: true, showAlways: true, label: 'Total Outstanding', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: function (w: any) { let total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); return `${currencyCode}. ${total.toLocaleString()}`; } }

        } } }

      },

      responsive: [{ breakpoint: 1445, options: { 
        
        chart: { type: "donut", height: 340 }, 
      
        legend: { 
        
          show: true, position: 'bottom', horizontalAlign: 'center', 
          
          floating: false, fontSize: '14px', fontFamily: '"Poppins", serif', 
          
          height: '50px',  width: 300, markers: { width: 2, height: 10, shape: 'square' },

          margin: { top: 30, right: 20, bottom: 10, left: 20 },

          itemMargin: { horizontal: 12, vertical: 10 } 
        
        },
      
      } }]

    };
    
  }

  getOutstandingAgeingList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(this.filterForm.get('outsPropertyOrUnit')?.value == false) {

      payload['ageingType'] = 'property';

      if(!_.isEmpty(this.filterForm.get('outsProperty')?.value)) {

        payload['property'] = this.filterForm.get('outsProperty')?.value

      }

    } else {

      payload['ageingType'] = 'unit';

      if(!_.isEmpty(this.filterForm.get('outsUnit')?.value)) {

        payload['Unit'] = this.filterForm.get('outsUnit')?.value

      }

    }

    this.service.postService({ url: '/dashboard/openOutsAgeingOwner', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['ticketAgeingPropertyOrUnitList'] = res.managerList || [];

        // this.masterList['ticketAgeingManagerList'] = res.managerList || [];

        // this.masterList['ticketAgeingStaffList'] = res.staffList || [];

      }

    });
    
  }






  // Rent Overdue Chart
  getRentOverdueChartList() {

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(!_.isEmpty(this.filterForm.get('rentOverduePropertyName')?.value)) {

      payload['property'] = this.filterForm.get('rentOverduePropertyName')?.value

    }

    this.service.postService({ url: '/dashboard/rentOverDue', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        let allRanges = ['< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month'];

        let colorMap: any = { '< 1 Month': '#2C5069', '1 - 2 Month': '#41769B', '2 - 3 Month': '#D2A119', '> 3 Month': '#E6B62F'  };

        let dataGrouped = _.keyBy(list, 'range');

        let labels = allRanges;

        let series = _.map(allRanges, range => dataGrouped[range]?.totalOutstanding || 0);

        let colors = _.map(allRanges, range => colorMap[range]);

        this.rentOverdueChartOption = { ...this.rentOverdueChartOption, labels, series, colors }; 
      
      }

    });

  }

  initRentOverdueChart() {

    let currencyCode = this.service?.currencyCode?.currencyCode;

    this.rentOverdueChartOption = {

      chart: { type: "donut", height: 350 }, 
      
      labels: [], series: [], colors: [],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center', 
        
        floating: false, fontSize: '14px', fontFamily: '"Poppins", serif', 
        
        height: '50px',  width: 414, markers: { width: 10, height: 10, shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        // itemMargin: { horizontal: 12, vertical: 10 } 
      
      },

      // dataLabels: {
      //   enabled: true,
      //   formatter: (value: number, opts: any) => {
      //     return `${currencyCode} ${value.toLocaleString()}`;
      //   },
      //   style: {
      //     fontSize: '14px',
      //     fontWeight: '700',
      //     colors: ['#000000']
      //   }
      // },

      dataLabels: { enabled: true },

      //   // custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {

      //   //   return `<span class="bg-white text-dark px-2"> ${w.globals.labels[seriesIndex]}<br>${currencyCode} ${w.globals.series[seriesIndex].toLocaleString()} </span>`;

      //   // },
        
      //   // formatter: (value: number, opts: any) => {

      //   //   console.log('Value', value);

      //   //   return `${currencyCode} ${value.toLocaleString()}`; 

      //   // },

      //   style: { fontSize: '14px', fontWeight: '700', colors: ['#000000'] }

      // },

      tooltip: { enabled: true,

        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {

          return `<span class="bg-white text-dark px-2"> ${w.globals.labels[seriesIndex]}<br>${currencyCode} ${w.globals.series[seriesIndex].toLocaleString()} </span>`;

        }

      },

      plotOptions: {

        pie: { donut: { size: '70%', labels: { 
          
          show: true, name: { show: true, color: "#00000080" },

          value: { offsetY: -2, color: '#000000', fontSize: '20', fontWeight: '700', formatter: (value: number) => `${currencyCode} ${value.toLocaleString()}` },

          total: { show: true, showAlways: true, label: 'Total Rent Overdue', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: function (w: any) { let total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); return `${currencyCode}. ${total.toLocaleString()}`; } }

        } } }

      },

      responsive: [{ breakpoint: 1445, options: { 
        
        chart: { type: "donut", height: 340 }, 
      
        legend: { 
        
          show: true, position: 'bottom', horizontalAlign: 'center', 
          
          floating: false, fontSize: '14px', fontFamily: '"Poppins", serif', 
          
          height: '50px',  width: 300, markers: { width: 2, height: 10, shape: 'square' },

          margin: { top: 30, right: 20, bottom: 10, left: 20 },

          itemMargin: { horizontal: 12, vertical: 10 } 
        
        },
      
      } }]

    };
    
  }




  getOverviewList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    payload['type'] = this.filterForm.get('overviewPay')?.value == 'propertyTaxPayHistory' ? 'tax' : 'rent';

    this.service.postService({ url: '/dashboard/overview', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['overViewList'] = res.data || [];

        this.limitedOverviewList = this.masterList['overViewList'].slice(0, 6);

      }

    });

  }

  openOverviewExpand() {

    this.modalService.open(this.openOverviewExpandModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number}): any{

    // if(fieldName == 'propertyOrUnit'){

    //   this.filterForm.patchValue({

    //     'propertyName': '',

    //     'unitName': ''

    //   })

    // }

    if(fieldName == 'managerOrStaff' ){ 

      this.filterForm.patchValue({

        'managerName': null,

        'staffName': null

      })

    }

    if(fieldName == 'outsPropertyOrUnit' ){ 

      this.filterForm.patchValue({

        'outsProperty': null,

        'outsUnit': null,

      })

    }

    if(fieldName == 'rentPropertyOrUnit'){

      this.filterForm.patchValue({

        'rentPropertyName': null,

        'rentUnitName': null

      })

    }

    if(fieldName == 'newRentPropertyOrUnit'){

      this.filterForm.patchValue({

        'newRentPropertyName': null,

        'newRentUnitName': null

      })

    }

    if(fieldName == 'utilityProperty'){

      this.filterForm.patchValue({

        'utilityPropertyName': null,

        'utilityName': null

      })

    }

    // this.getNewRentCollectionList(this.selectedNewRentDuration);

  }

  // Unit Detail Chart
  initUnitDetailsChart() {

    this.unitDetailsChart = {

      series: [45, 10],

      chart: { type: 'donut', height: 300 },

      labels: ['Occupied Unit', 'Vacant Unit'],

      colors: ['#1E90FF', '#FDB45C'],

      legend: { position: 'bottom', horizontalAlign: 'center', offsetY: 20, itemMargin: { vertical: 8 } }

    };

  }

  openTicketAgeingView(data: any, type: 'manager' | 'staff') {

    this.selectedData = data;

    this.viewType = type;

    if (type == 'manager') {

      this.selectedManagerStaffList = _.get(data, 'staffList', []);

    } else if (type == 'staff') {

      this.selectedManagerStaffList = _.get(data, 'managerList', []);

    }

    this.modalService.open(this.openTicketAgeingModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

}
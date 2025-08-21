import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexLegend, ApexNonAxisChartSeries, NgApexchartsModule, ChartComponent, ApexStroke, ApexFill } from 'ng-apexcharts';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export type unitChartOptions = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type rentOverdueChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type utilityOverdueChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type propertyTaxChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type DonutChartOptions = { series: ApexNonAxisChartSeries; chart: ApexChart; labels: string[]; responsive: ApexResponsive[]; legend?: ApexLegend; };


@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent {

  @ViewChild('openTicketAgeingModal') openTicketAgeingModal!: TemplateRef<any>;
  
  @ViewChild("chart") chart!: ChartComponent;

  public unitChartOptions!: Partial<unitChartOptions> | any;

  public rentOverdueChartOption!: Partial<rentOverdueChartOption> | any;

  public utilityOverdueChartOption!: Partial<utilityOverdueChartOption> | any;

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

              total: { show: true, showAlways: true, label: 'Total Units', fontSize: '14px', fontFamily: '"Poppins", serif' }

            }

          }

        }

      },   

      responsive: [{ breakpoint: 1441, options: { chart: { width: 0, height: 320 }, legend: { position: "bottom" } } } ]

      // responsive: [{ breakpoint: 1441, 
        
      //   options: { 

      //     chart: { height: 320 },

      //     legend: { position: "bottom" },

      //     plotOptions: {

      //       pie: {

      //         donut: {

      //           size: '70%',

      //           labels: { show: true,

      //             name: { show: true, color: "#00000080" },

      //             value:{ offsetY: -2, color:'#000000', fontSize: '20px', fontWeight: '700' },

      //             total: { show: true, showAlways: true, label: 'Total Units', fontSize: '14px', fontFamily: '"Poppins", serif' }

      //           }

      //         }

      //       }

      //     },

      //   } 
      
      // }]

    };

    this.rentOverdueChartOption = {

      chart: { type: "donut" },

      labels: [ '< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month' ],

      series: [ 20000, 12000, 5000, 8000 ],

      colors: [ '#2C5069', '#41769B', '#D2A119', '#E6B62F' ],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center', floating: false,

        fontSize: '16px', fontFamily: '"Poppins", serif', height: '50px',

        markers: { shape: 'square' }

      },

      dataLabels: { enabled: false },

      tooltip: {

        enabled: true,

        custom: function({series, seriesIndex, dataPointIndex, w}: any) {

          return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br> Rs ${w.globals.series[seriesIndex]}</span>`

        }

      },

      plotOptions: {

        pie: {

          donut: {

            size: '70%',

            labels: { show: true, name: { show: true, color: "#00000080" },

              value:{ offsetY: -2, color:'#000000', fontSize: '16px', fontWeight: '600' },

              total: { show: true, showAlways: true, label: 'Total Units', fontSize: '16px', fontFamily: '"Poppins", serif' }

            }

          }

        }

      }, 

      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]

    };

    this.utilityOverdueChartOption = {

      chart: { type: "donut" },

      labels: [ '< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month' ],

      series: [ 20000, 12000, 5000, 8000 ],

      colors: [ '#2C5069', '#41769B', '#D2A119', '#E6B62F' ],

      legend: { 
        
        show: true, position: 'bottom', horizontalAlign: 'center', floating: false,

        fontSize: '16px', fontFamily: '"Poppins", serif', height: '50px',

        markers: { shape: 'square' }

      },

      dataLabels: { enabled: false },

      tooltip: {

        enabled: true,

        custom: function({series, seriesIndex, dataPointIndex, w}: any) {

          return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br> Rs ${w.globals.series[seriesIndex]}</span>`

        }

      },

      plotOptions: {

        pie: {

          donut: {

            size: '70%',

            labels: { show: true, name: { show: true, color: "#00000080" },

              value:{ offsetY: -2, color:'#000', fontSize: '20px', fontWeight: '700' },

              total: { show: true, showAlways: true, label: 'Total Utility Overdue', fontSize: '14px', fontFamily: '"Poppins", serif' }

            }

          }

        }

      }, 

      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]

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
  };

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
  };

  propertyTaxChartOption: any = '';

  selectedAgeingType = 'property';
  isStaffView = false;
  masterList: any = {};
  permissions: any = {}
  userDetails: any  = {};
  _: any = _;
  filterForm: FormGroup = new FormGroup({});

  uniqueStaffList: any[] = [];
  selectedPropertyStaffList: any[] = [];
  selectedStaffProperty: any = null;
  viewType: 'property' | 'staff' = 'property'; 

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};
  topStats: any[] = [];
  ticketAgeing: any = [];

  selectedRentDuration = '1month';
  selectedUtilityDuration = '1month';
  rentCurrentOffset: number = 0; 
  utilityCurrentOffset: number = 0;
  monthsPerPage: number = 6;

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

    this.getOpenTicketAgeingList();

    this.getRentCollectionList(this.selectedRentDuration);

    this.getUtilityCollectionList(this.selectedUtilityDuration);

    this.getRentOverdueChartList();

    this.initRentOverdueChart();

    this.getUtilityOverdueChartList();

    this.initUtilityOverdueChart();

    this.getPropertyTaxChartList();

    this.initPropertyTaxChart();

  }

  getAllDetails(){

    if(_.size(this.masterList['companyList']) > 1) {
            
      this.companyId = _.map(this.masterList['companyList'], 'companyId')

    } else {

      this.companyId = this.companyId

    }

    forkJoin({

      'propertyList': this.service.postService({ 
        
        "url": "/property/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'manager' ? {'propertyIds': this.userDetails.propertyIds} : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...( this.userDetails?.userType == 'manager' ? {'propertyIds': this.userDetails?.propertyIds} : {}) },
        
        'loaderState': true

      }),

      'staffList': this.service.postService({ 
        
        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, 'userType': 'staff', 'propertyName': this.userDetails.propertyIds },
        
        'loaderState': true

      }),

      'utilityList': this.service.postService({ 
        
        "url": "/master/utility/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true },
        
        'loaderState': true

      }),

      'countList': this.service.postService({ 
        
        "url": "/dashboard/managerCount", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.staffList?.status == 'ok') this.masterList['staffList'] = res.staffList.data || [];

        if(res.utilityList?.status == 'ok') this.masterList['utilityList'] = res.utilityList.data || [];

        if(res?.countList) {

          this.masterList['countList'] = res.countList;

          this.topStats = [

            { label: 'Total Property', count: this.masterList['countList'].totalProperty || 0, icon: 'images/building-dashboard.png' },

            { label: 'Total Owners', count: this.masterList['countList'].totalOwners || 0, icon: 'images/totalOwners.png' },

            { label: 'Total Open Tickets', count: this.masterList['countList'].totalOpenTickets || 0, icon: 'images/open-tickets.png' },

            { label: 'Total Rent Overdue', count: this.masterList['countList'].totalRentOverdue || 0, icon: 'images/utltility-overDue.png' },

            { label: 'Total Utilities Overdue', count: this.masterList['countList'].totalUtilitiesOverdue || 0, icon: 'images/utltility-overDue.png' }

          ];

          let occupied = this.masterList['countList'].totalOccupiedUnits || 0;

          let vacant = this.masterList['countList'].totalNonOccupiedUnits || 0;

          this.unitChartOptions.series = [occupied, vacant];

        }

      }
      
    });
    
  }

  dashBoardform() {

    this.filterForm = this.fb.group({

      // 'propertyOrUnit': 'property',

      // 'topPropertyName': '',

      // 'topUnitName': '',
      
      'propertyOrStaff': [false],

      'propertyName': null,

      'staffName': null,

      'rentPropertyOrUnit': [false],

      'rentPropertyName': null,

      'rentUnitName': null,

      'utilityProperty': [false],

      'utilityPropertyName': null,

      'utilityName': null,

      'rentOverduePropertyName': null,

      'utilityOverduePropertyName': null,

      'propertyTaxStatus': 'all'

    });

    this.changeValue({});

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number}): any{

    // if(fieldName == 'propertyOrUnit'){

    //   this.filterForm.patchValue({

    //     'propertyName': '',

    //     'unitName': ''

    //   })

    // }

    if(fieldName == 'propertyOrStaff' ){ 

      this.filterForm.patchValue({

        'propertyName': null,

        'staffName': null

      })

    }

    if(fieldName == 'rentPropertyOrUnit'){

      this.filterForm.patchValue({

        'rentPropertyName': null,

        'rentUnitName': null

      })

    }

    if(fieldName == 'utilityProperty'){

      this.filterForm.patchValue({

        'utilityPropertyName': null,

        'utilityName': null

      })

    }

  }

  get f(): any { return this.filterForm.controls; }

  getOpenTicketAgeingList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if (this.filterForm.get('propertyOrStaff')?.value == false) {

      payload['ageingType'] = 'property';

      if (!_.isEmpty(this.filterForm.get('propertyName')?.value)) {

        payload['property'] = this.filterForm.get('propertyName')?.value;

      }

    } else {

      payload['ageingType'] = 'staff';

      if (!_.isEmpty(this.filterForm.get('staffName')?.value)) {

        payload['staff'] = this.filterForm.get('staffName')?.value;

      }

    }

    this.service.postService({ url: '/dashboard/openTicketAgeingManger', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['ticketAgeingPropertyList'] = res.propertyList || [];

        this.masterList['ticketAgeingStaffList'] = res.staffList || [];

      }

    });

  }

  openTicketAgeingView(data: any, type: 'property' | 'staff') {

    this.selectedData = data;

    this.viewType = type;

    if (type == 'property') {

      this.selectedPropertyStaffList = _.get(data, 'staffList', []);

    } else {

      this.selectedPropertyStaffList = _.get(data, 'propertyList', []);

      // let property = _.find(this.masterList['ticketAgeingList'], (m: any) => {

      //   return _.some(m.staffList, (s: any) => s.staffId == data.staffId);

      // });

      // this.selectedStaffProperty = property || null;

    }

    this.modalService.open(this.openTicketAgeingModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

  // Helper function to format numbers with 'k' and 'M'
  formatValue(value: number): string {

    if (value >= 1000000) {

      return (value / 1000000)?.toFixed(1) + 'M';

    } else if (value >= 1000) {

      return (value / 1000)?.toFixed(1) + 'k';

    } else {

      return value?.toString();

    }

  }

  // Rent Collection Trend Chat
  getRentCollectionList(duration?: any): void {

    this.selectedRentDuration = duration;

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds, 'dateRange': duration };

    if(this.filterForm.get('rentPropertyOrUnit')?.value == false) {

      payload['type'] = 'property';

      if(!_.isEmpty(this.filterForm.get('rentPropertyName')?.value)) {

        payload['property'] = this.filterForm.get('rentPropertyName')?.value

      }

    } else {

      payload['type'] = 'unit';

      if(!_.isEmpty(this.filterForm.get('rentUnitName')?.value)) {

        payload['unit'] = this.filterForm.get('rentUnitName')?.value

      }

    }

    this.service.postService({ url: '/dashboard/rentCollectionTrendManager', payload }).subscribe((res: any) => {

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
      
      fill: { type: 'gradient', gradient: { 
        
        // shade: 'light', 

        // type: 'vertical',

          opacityFrom: 0.6,

          opacityTo: 0.0,

          stops: [2, 60]

        }

      },

      dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.2 },

      dataLabels: { enabled: false, formatter: (val: number) => `${currencyCode}. ${this.formatValue(val)}`, style: { colors: ['#1C1C1C'], fontSize: '11px', fontWeight: '500' } },

      xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

      yaxis: { labels: { formatter: (val: number) => `${currencyCode}. ${this.formatValue(val)}`, style: { fontWeight: 600 } } },

      colors: ['#2C5069', '#F2B200'],

      legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

    };

  }

  // initRentTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {

  //   let currencyCode = this.service.currencyCode?.currencyCode;

  //   this.rentTrendChart = {

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

    this.service.postService({ url: '/dashboard/utilityCollectionTrendManager', payload }).subscribe((res: any) => {

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
      
      fill: { type: 'gradient', gradient: { 
        
        // shade: 'light', 

        // type: 'vertical',

          opacityFrom: 0.6,

          opacityTo: 0.0,

          stops: [2, 60]

        }

      },

      dropShadow: { enabled: true, top: 0, left: 0, blur: 3, opacity: 0.2 },

      dataLabels: { enabled: false, formatter: (val: number) => `${currencyCode}. ${this.formatValue(val)}`, style: { colors: ['#1C1C1C'], fontSize: '11px', fontWeight: '500' } },

      xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

      yaxis: { labels: { formatter: (val: number) => `${currencyCode}. ${this.formatValue(val)}`, style: { fontWeight: 600 } } },

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

  // initRentTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {

  //   this.rentTrendChart = {

  //     series: [ { name: 'Paid', data: paidData }, { name: 'Outstanding', data: outstandingData } ],

  //     chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },

  //     plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },

  //     dataLabels: { enabled: true, formatter: (val: number) => `Rs.${val.toLocaleString()}`, style: { colors: ['#000'], fontSize: '12px', fontWeight: 'bold' } },

  //     xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

  //     yaxis: { labels: { formatter: (val: number) => `Rs.${val.toLocaleString()}`, style: { fontWeight: 600 } } },

  //     colors: ['#264E86', '#E6B93C'],

  //     legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

  //   };

  // }

  // initUtilityTrendChart(categories: string[], paidData: number[], outstandingData: number[]) {

  //   this.utilityTrendChart = {

  //     series: [ { name: 'Paid', data: paidData }, { name: 'Outstanding', data: outstandingData } ],

  //     chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },

  //     plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },

  //     dataLabels: { enabled: true, formatter: (val: number) => `Rs.${val.toLocaleString()}`, style: { colors: ['#000'], fontSize: '12px', fontWeight: 'bold' } },

  //     xaxis: { categories: categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },

  //     yaxis: { labels: { formatter: (val: number) => `Rs.${val.toLocaleString()}`, style: { fontWeight: 600 } } },

  //     colors: ['#264E86', '#E6B93C'],

  //     legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', fontWeight: 600 }

  //   };

  // }

  getRentOverdueChartList() {

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(!_.isEmpty(this.filterForm.get('rentOverduePropertyName')?.value)) {

      payload['property'] = this.filterForm.get('rentOverduePropertyName')?.value

    }

    this.service.postService({ url: '/dashboard/rentOverDueManager', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        let allRanges = ['< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month'];

        let colorMap: any = { '< 1 Month': '#D2A119', '1 - 2 Month': '#E6B62F', '2 - 3 Month': '#EBC55B', '> 3 Month': '#F1D587' };

        let dataGrouped = _.keyBy(list, 'range');

        let labels = allRanges;

        let series = _.map(allRanges, range => dataGrouped[range]?.totalOutstanding || 0);

        let colors = _.map(allRanges, range => colorMap[range]);

        this.rentOverdueChartOption = { ...this.rentOverdueChartOption, labels, series, colors }; }

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
        
        height: '50px', width: 414, markers: { width: 10, height: 10, shape: 'square' },

        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        // itemMargin: { horizontal: 12, vertical: 10 } 
      
      },

      dataLabels: { enabled: false },

      tooltip: { enabled: true, custom: function ({ series, seriesIndex, dataPointIndex, w }: any) 
      
        { return `<span class="bg-white text-dark px-2"> ${w.globals.labels[seriesIndex]}<br>${currencyCode}. ${w.globals.series[seriesIndex].toLocaleString()} </span>`; }

      },

      plotOptions: {

        pie: {

          donut: { size: '70%', 
            
            labels: { show: true, name: { show: true, color: "#00000080" },

              value: { offsetY: -2, color: '#000000', fontSize: '20', fontWeight: '700', formatter: (value: number) => `${currencyCode} ${value.toLocaleString()}` },

              total: { show: true, showAlways: true, label: 'Total Rent Overdue', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: function (w: any) { let total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); return `${currencyCode}. ${total.toLocaleString()}`; } }

            }

          }

        }

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

      // responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]

      // responsive: [{ breakpoint: 1441, options: { chart: { width: 0, height: 320 }, legend: { position: "bottom" } } } ]

    };
    
  }

  getUtilityOverdueChartList() {

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(!_.isEmpty(this.filterForm.get('utilityOverduePropertyName')?.value)) {

      payload['property'] = this.filterForm.get('utilityOverduePropertyName')?.value

    }

    this.service.postService({ url: '/dashboard/utilityOverDueManager', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let list = res.data || [];

        let allRanges = ['< 1 Month', '1 - 2 Month', '2 - 3 Month', '> 3 Month'];

        let colorMap: any = { '< 1 Month': '#2C5069', '1 - 2 Month': '#41769B', '2 - 3 Month': '#5590B8', '> 3 Month': '#78A6C6' };

        let dataGrouped = _.keyBy(list, 'range');

        let labels = allRanges;

        let series = _.map(allRanges, range => dataGrouped[range]?.totalOutstanding || 0);

        let colors = _.map(allRanges, range => colorMap[range]);

        this.utilityOverdueChartOption = { ...this.utilityOverdueChartOption, labels, series, colors }; 
      
      }

    });

  }
  
  initUtilityOverdueChart() {

    let currencyCode = this.service?.currencyCode?.currencyCode;

    this.utilityOverdueChartOption = {

      chart: { type: "donut", height: 350 },

      labels: [], series: [], colors: [], 
      
      legend: { 
        
        show: true, position: 'bottom', 
        
        horizontalAlign: 'center', floating: false, 
        
        fontSize: '14px', fontFamily: '"Poppins", serif', 
        
        height: '50px', width: 414, markers: { width: 10, height: 10, shape: 'square' },
        
        margin: { top: 30, right: 20, bottom: 10, left: 20 },

        // itemMargin: { horizontal: 12, vertical: 10 } 
      
      },
        

      dataLabels: { enabled: false },

      tooltip: { enabled: true, custom: function ({ series, seriesIndex, dataPointIndex, w }: any) 
      
        { return `<span class="bg-white text-dark px-2"> ${w.globals.labels[seriesIndex]}<br>${currencyCode}. ${w.globals.series[seriesIndex].toLocaleString()} </span>`; }

      },

      plotOptions: {

        pie: {

          donut: { size: '70%', 
            
            labels: { show: true, name: { show: true, color: "#00000080" },

              value: { offsetY: -2, color: '#000000', fontSize: '20px', fontWeight: '700', formatter: (value: number) => `${currencyCode} ${value.toLocaleString()}` },

              total: { show: true, showAlways: true, label: 'Total Utility Overdue', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: function (w: any) { let total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); return `${currencyCode}. ${total.toLocaleString()}`; }

              }

            }

          }

        }

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

      // responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]

      // responsive: [{ breakpoint: 1441, options: { chart: { width: 0, height: 320 }, legend: { position: "bottom" } } } ]

    };
    
  }

  getPropertyTaxChartList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'property': this.userDetails.propertyIds };

    if(!_.isEmpty(this.filterForm.get('propertyTaxStatus')?.value)) {

      payload['status'] = this.filterForm.get('propertyTaxStatus')?.value

    }

    this.service.postService({ url: '/dashboard/propertyTaxStatus', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let data = res.data || [];

        let labelMap: any = { paid: 'Paid', notYetDue: 'Not Yet Due', due: 'Due', overdue: 'Overdue' };

        let colorMap: any = { Paid: '#2C5069', 'Not Yet Due': '#41769B', Due: '#D2A119', Overdue: '#E6B62F' };

        let displayOrder = ['paid', 'notYetDue', 'due', 'overdue'];

        let grouped = _.keyBy(data, 'status');

        let labels = displayOrder.map(key => labelMap[key]);

        let series = displayOrder.map(key => grouped[key]?.total || 0);

        let colors = labels.map(label => colorMap[label]);

        this.propertyTaxChartOption = { ...this.propertyTaxChartOption, labels, series, colors };

      }

    });

  }

  initPropertyTaxChart() {

    let currencyCode = this.service?.currencyCode?.currencyCode;

    this.propertyTaxChartOption = {

      chart: { type: 'radialBar', height: 350, offsetY: 0 },

      series: [], labels: [], colors: [],

      plotOptions: { radialBar: { startAngle: -90, endAngle: 270, track: { background: '#f0f0f0', strokeWidth: '100%', margin: 8 }, hollow: { size: '45%', background: 'transparent' },

          dataLabels: {

            name: { show: true, offsetY: -10, color: '#00000080', fontSize: '14px' },

            value: { show: true, color: '#000000', fontSize: '20px', fontWeight: '700' },

            total: { show: true, showAlways: true, label: 'Total Property Tax', fontSize: '14px', fontWeight: 400, color: '#000000', formatter: function (w: any) { let total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); return `${currencyCode}. ${total.toLocaleString()}`; }

            }

          }

        }
        
      },

      dataLabels: { enabled: false },

      tooltip: { enabled: true, custom: function ({ series, seriesIndex, w }: any) { return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br>${currencyCode}. ${series[seriesIndex].toLocaleString()}</span>`; } },

      legend: { 
        
        show: true, position: 'bottom', 
        
        horizontalAlign: 'center', fontSize: '14px', fontFamily: '"Poppins", serif', 
        
        markers: { width: 10, height: 10, shape: 'square' } 
      
      },

      responsive: [{ breakpoint: 1445, options: { 
        
        chart: { type: "radialBar", height: 340 }, 

        legend: { 
        
          show: true, position: 'bottom', width: 300,
          
          horizontalAlign: 'center', fontSize: '14px', fontFamily: '"Poppins", serif', 
          
          markers: { width: 10, height: 10, shape: 'square' } 
        
        },
        
      } }]

      // responsive: [{ breakpoint: 480, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }]

    };

  }

}

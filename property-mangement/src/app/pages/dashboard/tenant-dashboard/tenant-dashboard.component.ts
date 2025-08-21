import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexLegend, ApexNonAxisChartSeries, NgApexchartsModule, ChartComponent, ApexStroke, ApexFill } from 'ng-apexcharts';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

export type ticketSymaryChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrl: './tenant-dashboard.component.scss'
})
export class TenantDashboardComponent {

  public ticketSymaryChartOption!: Partial<ticketSymaryChartOption> | any;

  @ViewChild('openOverviewExpandModal') openOverviewExpandModal!: TemplateRef<any>;

  constructor(public service: CommonService, private fb: FormBuilder, private modalService: NgbModal) {

    this.ticketSymaryChartOption = {

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

              value:{ offsetY: -2, color:'#000', fontSize: '16px', fontWeight: '600' },

              total: { show: true, showAlways: true, label: 'Total Units', fontSize: '16px', fontFamily: '"Poppins", serif' }

            }

          }

        }

      }, 

      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]

    };

  }

  rentPaymentTrend!: {
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

  masterList: any = {};
  permissions: any = {}
  userDetails: any = {};
  currencyCode: any = {};
  _: any = _;
  filterForm: FormGroup = new FormGroup({});

  companyId: any = {};
  branchId: any = {};
  branchList: any = {};

  topStats: any[] = [];
  ticketAgeing: any = [];

  selectedRentDuration = '1month';
  selectedUtilityDuration = '1month';
  ticketsSummaryDuration = '1month';
  limitedOverviewList: any[] = [];

  rentCurrentOffset: number = 0; 
  utilityCurrentOffset: number = 0;
  monthsPerPage: number = 6;

  rentNavigateNext: boolean = true;
  rentNavigatePrev: boolean = false;
  utilityNavigateNext: boolean = true;
  utilityNavigatePrev: boolean = false;

  ngOnInit(): void {

    this.permissions = this.service.getPermissions({ pathArr: ["Owner Dashboard"], isNeedBranchList: true, 'permission': ['create', 'view', 'edit', 'delete']});
                  
    this.masterList = {
      
      'companyList': this.permissions.viewPermission?.companyList || [],

      'branchList': this.permissions.viewPermission?.branchList || []

    }

    this.currencyCode = this.service.currencyCode?.currencyCode;

    this.userDetails = JSON.parse(this.service.session({ "method": "get", "key": "UserDetails" })) || {};

    this.branchList = _.filter(this.masterList['branchList'], { companyId: (<any> _.first(this.masterList['companyList']))?.companyId})

    this.companyId = _.get(_.first(this.branchList), 'companyId');

    this.branchId = _.get(_.first(this.branchList), 'branchId');

    this.getAllDetails();

    this.dashBoardform();

    this.getRentCollectionList(this.selectedRentDuration);

    this.getUtilityPaymentCollectionList(this.selectedUtilityDuration);

    this.getTicketSymaryChartList(this.ticketsSummaryDuration);

    this.initticketSymaryChart();

    this.getOverviewList();

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
        
        "url": "/dashboard/tenantCount", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'unit': this.userDetails.unitName },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.staffList?.status == 'ok') this.masterList['staffList'] = res.staffList.data || [];

        if(res.utilityList?.status == 'ok') this.masterList['utilityList'] = res.utilityList.data || [];

        if(res?.countList) {

          this.masterList['countList'] = res.countList?.data;

          this.topStats = [

            { label: 'Total Rent Due', count: this.masterList['countList'].totalRentDue || 0, icon: 'images/building-dashboard.png' },

            { label: 'Total Utility Due', count: this.masterList['countList'].totalUtilityDue || 0, icon: 'images/totalOwners.png' },

            { label: 'Open Service Tickets', count: this.masterList['countList'].totalOpenTickets, icon: 'images/open-tickets.png' },

            { label: 'Deposit Amount Paid', count: this.masterList['countList'].totalDepositPaid || 0, icon: 'images/utltility-overDue.png' }

          ];

          if (this.userDetails.userType == 'tenant') {

            this.topStats.splice(3, 0, { label: 'Contract Renewal Date', count: moment(this.masterList['countList'].contractRenewalDate).format('DD-MM-YYYY'), icon: 'images/utltility-overDue.png' });

          }

        }

      }
      
    });
    
  }

  dashBoardform() {

    this.filterForm = this.fb.group({

      'utilityName': null,

      'ticketSummary': ['1month'],

      'overviewPdc': 'notUtilizedPdc'

    });

  }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number}): any{

    let ticketsduration = this.filterForm.get('ticketSummary')?.value || '1month';

    this.getTicketSymaryChartList(ticketsduration);

  }

  get f(): any { return this.filterForm.controls; }

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

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'unit': this.userDetails.unitName, 'dateRange': duration };

    this.service.postService({ url: '/dashboard/tenantRentCollectiontrend', payload }).subscribe((res: any) => {

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

        this.initrentPaymentTrend(categories, paidData, outstandingData);

      }

    });

  }

  initrentPaymentTrend(categories: string[], paidData: number[], outstandingData: number[]) {
    
    let currencyCode = this.service.currencyCode?.currencyCode;

    this.rentPaymentTrend = {

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

  // initrentPaymentTrend(categories: string[], paidData: number[], outstandingData: number[]) {

  //   let currencyCode = this.service.currencyCode?.currencyCode;

  //   this.rentPaymentTrend = {

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

    this.initrentPaymentTrend(categories, paidData, outstandingData);

  }

  // Utility Collection Trend Chat Start
  getUtilityPaymentCollectionList(duration?: any): void {

    this.selectedUtilityDuration = duration;

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'unit': this.userDetails.unitName, 'dateRange': duration };

      if(!_.isEmpty(this.filterForm.get('utilityName')?.value)) {

        payload['utility'] = this.filterForm.get('utilityName')?.value

      }


    this.service.postService({ url: '/dashboard/tenantUtilityBillCollectiontrend', payload }).subscribe((res: any) => {

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

  // Tickets Summary List
  getTicketSymaryChartList(duration?: any): void {

    this.ticketsSummaryDuration = duration;

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'unit': this.userDetails.unitName, 'dateRange': duration };

    this.service.postService({ url: '/dashboard/ticketSummaryTenant', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let data = res.data || {};

        let series = [ data.assigned || 0, data.closedFeedbackPending || 0, data.resolvedFeedbackPending || 0, data.closed || 0, data.resolved || 0 ];

        let labels = [ 'Assigned', 'Closed - Feedback Pending', 'Resolved - Feedback Pending', 'Closed', 'Resolved' ];

        let colors = ['#D2A119', '#F4E7C2', '#F1D587', '#EBC55B', '#E6B62F'];

        this.ticketSymaryChartOption = {

          chart: { type: "donut", height: 350, fontFamily: 'Poppins, sans-serif', toolbar: { show: false } },

          labels, series, colors,

          dataLabels: { enabled: false },

          tooltip: { enabled: true, custom: ({ series, seriesIndex, w }: any) => { return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br>${series[seriesIndex]} Tickets</span>`; } },

          legend: { 
            
            show: true, position: 'bottom', horizontalAlign: 'center', 
            
            fontSize: '14px', fontFamily: '"Poppins", sans-serif', 
            
            width: 414, markers: { width: 10, height: 10, shape: 'square' },

            margin: { top: 30, right: 20, bottom: 10, left: 20 },
            
            formatter: (label: string) => label 
          
          },

          plotOptions: {

            pie: {

              donut: {

                size: '70%', 
                
                labels: { show: true,  name: { show: true, color: "#00000080" },  
                
                value: { offsetY: -2, color: '#000000', fontSize: '20px', fontWeight: '700' },

                total: { show: true, showAlways: true, label: 'Total Tickets', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: () => series.reduce((a, b) => a + b, 0).toString() }  
              
              }

              }

            }
            
          },

          responsive: [ { breakpoint: 480, options: { chart: { width: 250 }, legend: { position: 'bottom' } } } ]

        };

      }

    });

  }

  initticketSymaryChart() {

    this.ticketSymaryChartOption = {

      chart: { type: "donut" },

      labels: [], series: [], colors: [],

      legend: { show: true, position: 'bottom', horizontalAlign: 'center', fontSize: '16px', fontFamily: '"Poppins", serif', markers: { shape: 'square' } },

      dataLabels: { enabled: false },

      tooltip: { enabled: true },
      
      plotOptions: {

        pie: {

          donut: { 
            
            size: '70%',

            labels: { show: true, name: { show: true, color: "#00000080" }, value: { offsetY: -2, color: '#000', fontSize: '16px', fontWeight: '600' }, total: { show: true, showAlways: true, label: 'Total Tickets', fontSize: '16px', fontFamily: '"Poppins", serif' } }

          }

        }

      },

      responsive: [

        { breakpoint: 480, options: { chart: { width: 250 }, legend: { position: "bottom" } } }

      ]

    };

  }

  getOverviewList() {

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, 'unit': this.userDetails.unitName };

    if(this.filterForm.get('overviewPdc')?.value == 'notUtilizedPdc') {

      payload['type'] = 'unusedPdc';

    }else if(this.filterForm.get('overviewPdc')?.value == 'contractOverview') {

      payload['type'] = 'contract';

    } else if(this.filterForm.get('overviewPdc')?.value == 'recentRentPayment') {

      payload['type'] = 'recentRent';

    } else {

      payload['type'] = 'recentUtility';

    }

    this.service.postService({ url: '/dashboard/getUnitOverview', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['ticketHistory'] = res.data;

        this.limitedOverviewList = this.masterList['ticketHistory'].slice(0, 6);

      }

    });

  }

  openOverviewExpand() {

    this.modalService.open(this.openOverviewExpandModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }
  
  getRentStatus(rent: any): string {
    
    let today = new Date();
    
    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(rent?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = rent?.amountDue ?? 0;

    let amountPaid = rent?.amountPaid ?? 0;

    if (rent?.status === 'Free') return 'Free';

    if (amountPaid >= amountDue && amountDue > 0) return 'Paid';

    let dueMonth = dueDate.getMonth();

    let dueYear = dueDate.getFullYear();

    let currentMonth = today.getMonth();

    let currentYear = today.getFullYear();

    if (dueYear == currentYear && dueMonth == currentMonth) {

      if (dueDate >= today) return 'Upcoming';

      else return 'Overdue';

    }

    if (dueDate > today) return 'Not yet Due';

    return 'Overdue';

  }

  getUtilityStatus(item: any): string {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let dueDate = new Date(item?.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    let amountDue = item?.utilityAmount ?? item?.taxAmount ?? 0;

    let amountPaid = item?.amountPaid ?? 0;

    if (amountPaid >= amountDue && amountDue > 0) {

      return 'Paid';

    }

    let dueMonth = dueDate.getMonth();

    let dueYear = dueDate.getFullYear();

    let currentMonth = today.getMonth();

    let currentYear = today.getFullYear();

    if (dueYear == currentYear && dueMonth == currentMonth) {

      if (dueDate >= today) return 'Upcoming';

      else return 'Overdue';

    }

    if (dueDate > today) return 'Not yet Due';

    return 'Overdue';

  }

}

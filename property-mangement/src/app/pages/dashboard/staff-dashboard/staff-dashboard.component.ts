import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '@app/shared/services/common/common.service';
import { SharedModule } from '@app/shared/shared.module';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexPlotOptions, ApexLegend, ApexNonAxisChartSeries, NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export type openTicketsPriority = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };
export type ticketSymaryChartOption = { series: ApexAxisChartSeries; chart: ApexChart; xaxis: ApexXAxis; dataLabels: ApexDataLabels; fill: ApexFill; stroke: ApexStroke; yaxis?: ApexYAxis; tooltip?: ApexTooltip; plotOptions?: ApexPlotOptions; labels?: string[]; legend?: ApexLegend; colors?: string[]; responsive?: ApexResponsive[]; grid?: ApexGrid; };

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './staff-dashboard.component.html',
  styleUrl: './staff-dashboard.component.scss'
})
export class StaffDashboardComponent {

  @ViewChild('openTicketAgeingModal') openTicketAgeingModal!: TemplateRef<any>;

  @ViewChild('openOverviewExpandModal') openOverviewExpandModal!: TemplateRef<any>;

  @ViewChild("chart") chart!: ChartComponent;

  public ticketSymaryChartOption!: Partial<ticketSymaryChartOption> | any;

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

  rentTrendChart: any;

  selectedAgeingType = 'manager';
  isStaffView = false;
  masterList: any = {};
  permissions: any = {}
  userDetails: any  = {};
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
  ticketsProorityDuration = '1month';
  ticketsSummaryDuration = '1month';

  openTicketsPriority: any = {};
  totalOpenTicketCount: number = 0;
  limitedOverviewList: any[] = [];

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

    this.getOpenTicketsPriorityList(this.ticketsProorityDuration);

    this.getRentCollectionList();

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
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...(this.userDetails.userType == 'owner' ? {'propertyIds': this.userDetails.propertyIds} : {}) },
        
        'loaderState': true

      }),

      'unitList': this.service.postService({ 
        
        "url": "/unit/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, ...( this.userDetails?.userType == 'owner' ? {'propertyIds': this.userDetails?.propertyIds} : {} ) },
        
        'loaderState': true

      }),

      'managerList': this.service.postService({ 
        
        "url": "/otherUser/list", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId,'companyId': this.companyId, 'branchId': this.branchId, is_active: true, 'userType': 'manager', 'propertyIds': this.userDetails.propertyIds },
        
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
        
        "url": "/dashboard/staffCount", 
        
        payload: { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'staff' ? {'staff': this.userDetails.id} : {}) },
        
        'loaderState': true

      }),

    }).subscribe({
  
      next: (res: any) => {
        
        if(res.propertyList?.status == 'ok') this.masterList['propertyList'] = res.propertyList.data || [];

        if(res.unitList?.status == 'ok') this.masterList['unitList'] = res.unitList.data || [];

        if(res.managerList?.status == 'ok') this.masterList['managerList'] = res.managerList.data || [];

        if(res.staffList?.status == 'ok') this.masterList['staffList'] = res.staffList.data || [];

        if(res.utilityList?.status == 'ok') this.masterList['utilityList'] = res.utilityList.data || [];

        if(res?.countList) {

          this.masterList['countList'] = res.countList?.data;

          this.topStats = [

            { label: 'Total Open Tickets', count: this.masterList['countList'].totalOpenTickets || 0, icon: 'images/open-tickets.png' },

            { label: 'Tickets Received Today', count: this.masterList['countList'].todayTicketsCount || 0, icon: 'images/tickets-received-today.png' },
            
            { label: 'Tickets MTD', count: this.masterList['countList'].ticketsMtd || 0, icon: 'images/tickets-mid-yid.png' },

            { label: 'Tickets YTD', count: this.masterList['countList'].ticketsYtd || 0, icon: 'images/tickets-mid-yid.png' },

            { label: 'Tickets Feedback Awaited', count: this.masterList['countList'].feedbackPendingCount || 0, icon: 'images/tickets-feedback-awaited.png' },

          ];

          // let occupied = this.masterList['countList'].totalOccupiedUnits || 0;

          // let vacant = this.masterList['countList'].totalNonOccupiedUnits || 0;

          // this.openTicketsPriority.series = [occupied, vacant];

        }

      }
      
    });
    
  }

  dashBoardform() {

    this.filterForm = this.fb.group({

      'openTicketsPriority': ['1month'],

      'ticketSummary': ['1month'],

    });

  }

  get f(): any { return this.filterForm.controls; }

  changeValue({ fieldName = '', index = -1 }: { fieldName?: string, index?: number}): any{

    let duration = this.filterForm.get('openTicketsPriority')?.value || '1month';

    let ticketsduration = this.filterForm.get('ticketSummary')?.value || '1month';

    this.getOpenTicketsPriorityList(duration);

    this.getTicketSymaryChartList(ticketsduration);

    // if(fieldName == 'propertyOrUnit'){

    //   this.filterForm.patchValue({

    //     'propertyName': '',

    //     'unitName': ''

    //   })

    // }

  }

  getOpenTicketsPriorityList(duration?: any): void {
    
    this.ticketsProorityDuration = duration;

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'staff' ? {'staff': this.userDetails.id} : {}), 'dateRange': duration };
 
    this.service.postService({ url: '/dashboard/staffOpenTicketsPriority', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        let data = _.get(res, 'data.data', []);

        let priorityMap: any = { high: 0, medium: 0, low: 0 };

        _.forEach(data, (item: any) => {

          let key = _.get(item, 'priority', '').toLowerCase();

          let count = _.get(item, 'count', 0);

          if (priorityMap.hasOwnProperty(key)) { priorityMap[key] = count; }

        });

        this.totalOpenTicketCount = _.reduce(priorityMap, (sum, val) => sum + val, 0);

        this.openTicketsPriority = {

          chart: { type: 'pie', fontFamily: 'Poppins, sans-serif', height: 300, toolbar: { show: false } },

          labels: ['High', 'Medium', 'Low'],

          series: [priorityMap.high, priorityMap.medium, priorityMap.low],

          colors: ['#2C5069', '#4A7A9C', '#D2A119'],

          dataLabels: { enabled: true,

            style: { fontSize: '14px', fontWeight: '500', colors: ['#2C5069', '#4A7A9C', '#D2A119'] },

            formatter: (val: any, opts: any) => { return `${opts.w.globals.labels[opts.seriesIndex]} ${opts.w.config.series[opts.seriesIndex]}`; }

          },

          tooltip: { enabled: true,

            y: {

              formatter: (val: number) => `${val} Tickets`

            }

          },

          legend: { 
            
            show: true, position: 'bottom', horizontalAlign: 'center', 
            
            fontSize: '14px', fontFamily: 'Poppins, sans-serif', 
            
            markers: { width: 10, height: 10, shape: 'square' },

            margin: { top: 30, right: 20, bottom: 10, left: 20 },

            itemMargin: { horizontal: 20, vertical: 10 } 
          
          },

          plotOptions: { pie: { expandOnClick: false, dataLabels: { offset: 15} } },

          responsive: [ { breakpoint: 480, options: { chart: { width: 250 }, legend: { position: 'bottom' } } } ]

        };

      }

    });

  }

  getRentCollectionList(): void {

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'staff' ? {'staff': this.userDetails.id} : {}) };

    this.service.postService({ url: '/dashboard/staffOpenTicketsAgeing', payload }).subscribe((res: any) => {

      if (_.get(res, 'status') == 'ok') {

        this.masterList['rentCollectionList'] = res.data;

        let expectedLabels = [ '0 - 2 Days', '2 Days - 7 Days', '7 Days - 2 Weeks', '2 Weeks - 1 Month', '> 1 Month' ];

        let normalize = (str: string) => _.trim(str).toLowerCase().replace(/\s+/g, ' ');

        let chartData = _.map(expectedLabels, label => {

          let match = _.find(this.masterList['rentCollectionList'], item => normalize(item.ageing) == normalize(label));

          return _.get(match, 'count', 0);

        });

        this.initRentTrendChart(expectedLabels, chartData);

      }

    });

  }

  initRentTrendChart(categories: string[], seriesData: number[]): void {

    this.rentTrendChart = {

      series: [ { name: 'Open Tickets', data: seriesData } ],

      chart: { type: 'bar', height: 300, toolbar: { show: false } },

      plotOptions: { bar: { borderRadius: 5, columnWidth: '25%', distributed: true } },

      dataLabels: { enabled: true, style: { fontWeight: 'bold', fontSize: '13px', colors: ['#000'] } },

      xaxis: { categories, labels: { style: { fontSize: '12px', fontWeight: 600 } } },
      
      yaxis: { labels: { style: {fontWeight: 600} } },

      colors: ['#2C5069', '#41769B', '#5590B8', '#D2A119', '#E6B62F'],

      legend: { show: false }

    };

  }

  getTicketSymaryChartList(duration?: any): void {

    this.ticketsSummaryDuration = duration;

    let payload = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'staff' ? {'staff': this.userDetails.id} : {}), 'dateRange': duration };

    this.service.postService({ url: '/dashboard/ticketSummaryStaff', payload }).subscribe((res: any) => {

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
            
            show: true, position: 'bottom', horizontalAlign: 'center', fontSize: '14px', 
            
            fontFamily: '"Poppins", sans-serif', 
            
            width: 414, markers: { width: 10, height: 10, shape: 'square' },

            margin: { top: 30, right: 20, bottom: 10, left: 20 },
            
            formatter: (label: string) => label 
          
          },

          plotOptions: {

            pie: {

              donut: {

                size: '70%', labels: { show: true,  name: { show: true, color: "#00000080" },  
                
                value: { offsetY: -2, color: '#000000', fontSize: '20px', fontWeight: '700' },

                total: { show: true, showAlways: true, label: 'Total Tickets', fontSize: '14px', fontWeight: '400', fontFamily: '"Poppins", serif', formatter: () => series.reduce((a, b) => a + b, 0).toString() } }

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

    let payload: any = { 'parentCompanyId': this.userDetails.parentCompanyId, 'companyId': this.companyId, 'branchId': this.branchId, ...(this.userDetails.userType == 'staff' ? {'staff': this.userDetails.id} : {}) };

    this.service.postService({ url: '/dashboard/lastestTicketHistory', payload }).subscribe((res: any) => {

      if (res.status == 'ok') {

        this.masterList['ticketHistory'] = res.data;

        this.limitedOverviewList = this.masterList['ticketHistory'].slice(0, 6);

      }

    });

  }

  openOverviewExpand() {

    this.modalService.open(this.openOverviewExpandModal, { centered: true, size: 'xl', backdrop: 'static', keyboard: false });

  }

}

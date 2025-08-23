import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { LayoutModule } from '@app/_core/layout/layout.module';
import { ChartComponent, NgApexchartsModule } from "ng-apexcharts";
import { SharedModule } from '@app/shared/shared.module';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LayoutModule,
    NgApexchartsModule,
    SharedModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;

  topSummaryCards : any = [
  { count: 20, title: 'Total Property', icon: 'assets/images/building-dashboard.png' },
  { count: 8, title: 'Total Rent Collected', icon: 'assets/images/rent-collected.png' },
  { count: 10, title: 'Total Rent Overdue', icon: 'assets/images/rent-overdue.png' },
  { count: 30, title: 'Total Open Tickets', icon: 'assets/images/tickets.png' }
];

  constructor() {
    this.chartOptions = {
      chart: {
        type: "donut"
      },
      labels: ["Paid","Pending"],
      series: [235000,265000],
      colors: ['#D2A119','#2C5069'],

      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center', 
        floating: false,
        fontSize: '16px',
        fontFamily: '"Poppins", serif',
        height: '50px',
        markers: {
          shape: 'square'
        }
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        custom: function({series, seriesIndex, dataPointIndex, w}: any) {
          // var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          return `<span class="bg-white text-dark px-2">${w.globals.labels[seriesIndex]}<br> KGS ${w.globals.series[seriesIndex]}</span>`
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                color: "#00000080"
              },
              value:{
                offsetY: -2, // -8 worked for me
                color:'#000',
                fontSize: '16px',
                fontWeight: '600'
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Units',
                fontSize: '16px',
                fontFamily: '"Poppins", serif', 
                // formatter: function (w: any) {
                //   return "Units " + w.globals.seriesTotals.reduce((a: any, b: any) => {
                //     return a + b
                //   }, 0).toLocaleString('ky-KG');
                // }
              }           
            }
          }
        }
      },      
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

}
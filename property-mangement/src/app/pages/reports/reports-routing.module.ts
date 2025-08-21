import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path:"",
    component:ReportsComponent
  },
  {
    path: 'report-export',
    loadComponent: () => import('@app/pages/reports/report-export/report-export.component').then(m => m.ReportExportComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

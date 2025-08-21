import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerDashboardRoutingModule } from './manager-dashboard-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ManagerDashboardRoutingModule,
    SharedModule
  ]
})
export class ManagerDashboardModule { }

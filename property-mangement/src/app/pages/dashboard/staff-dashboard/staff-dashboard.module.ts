import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffDashboardRoutingModule } from './staff-dashboard-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StaffDashboardRoutingModule,
    SharedModule
  ]
})
export class StaffDashboardModule { }

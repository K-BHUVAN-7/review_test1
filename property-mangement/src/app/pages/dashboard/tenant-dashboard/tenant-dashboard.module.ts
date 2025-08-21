import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenantDashboardRoutingModule } from './tenant-dashboard-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TenantDashboardRoutingModule,
    SharedModule
  ]
})
export class TenantDashboardModule { }

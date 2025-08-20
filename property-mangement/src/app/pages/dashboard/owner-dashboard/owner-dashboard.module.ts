import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OwnerDashboardRoutingModule } from './owner-dashboard-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OwnerDashboardRoutingModule,
    SharedModule,
  ]
})
export class OwnerDashboardModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RentRoutingModule } from './rent-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RentRoutingModule,
    SharedModule
  ]
})
export class RentModule { }

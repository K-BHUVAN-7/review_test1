import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { SharedModule } from '@app/shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RolesRoutingModule,
    SharedModule
  ]
})
export class RolesModule { }

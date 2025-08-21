import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { LayoutModule } from '@app/_core/layout/layout.module';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    PagesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PagesRoutingModule,
    LayoutModule,
    NgSelectModule,
  ]
})
export class PagesModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilityBillComponent } from './utility-bill.component';

const routes: Routes = [
  {
    path: "",
    component: UtilityBillComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilityBillRoutingModule { }

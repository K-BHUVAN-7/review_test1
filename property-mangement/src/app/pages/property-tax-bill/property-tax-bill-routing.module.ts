import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyTaxBillComponent } from './property-tax-bill.component';

const routes: Routes = [
  {
    path: "",
    component: PropertyTaxBillComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyTaxBillRoutingModule { }

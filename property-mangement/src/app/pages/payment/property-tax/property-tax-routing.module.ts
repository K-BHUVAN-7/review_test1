import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyTaxComponent } from './property-tax.component';

const routes: Routes = [
  {
    path: "",
    component: PropertyTaxComponent
  },
  {
    path: 'pay-property-tax',
    loadComponent: () => import('@app/pages/payment/property-tax/pay-property-tax/pay-property-tax.component').then(m => m.PayPropertyTaxComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyTaxRoutingModule { }

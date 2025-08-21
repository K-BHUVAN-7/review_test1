import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilityPaymentComponent } from './utility-payment.component';

const routes: Routes = [
  {
    path: "",
    component: UtilityPaymentComponent
  },
  {
    path: 'pay-utility',
    loadComponent: () => import('@app/pages/payment/utility-payment/pay-utility-amount/pay-utility-amount.component').then(m => m.PayUtilityAmountComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilityPaymentRoutingModule { }

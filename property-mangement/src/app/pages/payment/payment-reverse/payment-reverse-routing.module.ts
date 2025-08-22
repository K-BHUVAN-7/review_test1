import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentReverseComponent } from './payment-reverse.component';

const routes: Routes = [
  {
    path: "",
    component: PaymentReverseComponent
  },
  {
    path: 'pay-payment-reverse',
    loadComponent: () => import('@app/pages/payment/payment-reverse/pay-payment-reverse/pay-payment-reverse.component').then(m => m.PayPaymentReverseComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentReverseRoutingModule { }

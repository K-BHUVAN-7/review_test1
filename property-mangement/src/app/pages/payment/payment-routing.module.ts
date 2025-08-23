import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';

const routes: Routes = [
  {
    path: "",
    component: PaymentComponent
  },
  {
    path: 'rent',
    loadChildren: () => import('@app/pages/payment/rent/rent.module').then(m => m.RentModule)
  },
  {
    path: 'deposit',
    loadChildren: () => import('@app/pages/payment/deposit/deposit.module').then(m => m.DepositModule)
  },
  {
    path: 'tax',
    loadChildren: () => import('@app/pages/payment/property-tax/property-tax.module').then(m => m.PropertyTaxModule)
  },
  {
    path: 'reverse',
    loadChildren: () => import('@app/pages/payment/payment-reverse/payment-reverse.module').then(m => m.PaymentReverseModule)
  },
  {
    path: 'utility',
    loadChildren: () => import('@app/pages/payment/utility-payment/utility-payment.module').then(m => m.UtilityPaymentModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }

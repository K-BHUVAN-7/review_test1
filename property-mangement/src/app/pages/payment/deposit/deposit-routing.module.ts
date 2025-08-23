import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepositComponent } from './deposit.component';

const routes: Routes = [
  {
    path: '',
    component: DepositComponent
  },
  {
    path: 'receive',
    loadComponent: () => import('@app/pages/payment/deposit/receive/receive.component').then(m => m.ReceiveComponent)
  },
  {
    path: 'refund',
    loadComponent: () => import('@app/pages/payment/deposit/refund/refund.component').then(m => m.RefundComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepositRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RentComponent } from './rent.component';

const routes: Routes = [
  {
    path: "",
    component: RentComponent
  },
  {
    path: 'rent-details',
    loadComponent: () => import('@app/pages/payment/rent/rent-details/rent-details.component').then(m => m.RentDetailsComponent)
  },
  {
    path: 'update-payment',
    loadComponent: () => import('@app/pages/payment/rent/update-payment/update-payment.component').then(m => m.UpdatePaymentComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentRoutingModule { }

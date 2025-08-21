import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>import('@app/pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'property',
        loadChildren: () => import('@app/pages/property/property.module').then(m => m.PropertyModule)
      },
      {
        path: 'units',
        loadChildren: () => import('@app/pages/units/units.module').then( m => m.UnitsModule),
      },
      {
        path: 'payment',
        loadChildren: () => import('@app/pages/payment/payment.module').then(m => m.PaymentModule)
      },
      {
        path: 'masters',
        loadChildren: () => import('@app/pages/masters/masters.module').then(m => m.MastersModule)
      },
      {
        path: 'owner',
        loadChildren: () =>import('@app/pages/owner/owner.module').then((m) => m.OwnerModule),
      },
      {
        path: 'manager',
        loadChildren: () =>import('@app/pages/manager/manager.module').then((m) => m.ManagerModule),
      },
      {
        path:"staff",
        loadChildren: ()=> import('@app/pages/staff/staff.module').then((m)=> m.StaffModule)
      },
      {
        path:"tenant",
        loadChildren: ()=> import('@app/pages/tenant/tenant.module').then((m)=> m.TenantModule)
      },
      {
        path:"tickets",
        loadChildren: ()=> import('@app/pages/tickets/tickets.module').then((m)=> m.TicketsModule)
      },
      {
        path:"utility-bill",
        loadChildren: ()=> import('@app/pages/utility-bill/utility-bill.module').then((m)=> m.UtilityBillModule)
      },
      {
        path:"property-tax-bill",
        loadChildren: ()=> import('@app/pages/property-tax-bill/property-tax-bill.module').then((m)=> m.PropertyTaxBillModule)
      },
      {
        path:"reports",
        loadChildren: ()=> import('@app/pages/reports/reports.module').then((m)=> m.ReportsModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}

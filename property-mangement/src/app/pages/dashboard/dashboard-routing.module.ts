import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path:"",
    component:DashboardComponent
  },
  {
    path:"owner-dashboard",
    loadChildren: ()=> import('@app/pages/dashboard/owner-dashboard/owner-dashboard.module').then((m)=> m.OwnerDashboardModule)
  },
  {
    path:"tenant-dashboard",
    loadChildren: ()=> import('@app/pages/dashboard/tenant-dashboard/tenant-dashboard.module').then((m)=> m.TenantDashboardModule)
  },
  {
    path:"manager-dashboard",
    loadChildren: ()=> import('@app/pages/dashboard/manager-dashboard/manager-dashboard.module').then((m)=> m.ManagerDashboardModule)
  },
  // {
  //   path:"owner-dashboard",
  //   loadChildren: ()=> import('@app/pages/dashboard/owner-dashboard/owner-dashboard.module').then((m)=> m.OwnerDashboardModule)
  // },
  // {
  //   path: '',
  //   redirectTo: 'owner/dashboard',
  //   pathMatch: 'full',
  // },
  // {
  //   path: '**',
  //   redirectTo: 'owner/dashboard',
  //   pathMatch: 'full',
  // },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

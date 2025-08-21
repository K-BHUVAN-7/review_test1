import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketsComponent } from './tickets.component';

const routes: Routes = [
  {
    path: "",
    component: TicketsComponent
  },
  {
    path:"tenant-tickets",
    loadChildren: ()=> import('@app/pages/tickets/tenant-tickets/tenant-tickets.module').then((m)=> m.TenantTicketsModule)
  },
  {
    path:"manager-tickets",
    loadChildren: ()=> import('@app/pages/tickets/manager-tickets/manager-tickets.module').then((m)=> m.ManagerTicketsModule)
  },
  {
    path:"staff-tickets",
    loadChildren: ()=> import('@app/pages/tickets/staff-tickets/staff-tickets.module').then((m)=> m.StaffTicketsModule)
  },
  {
    path:"owner-tickets",
    loadChildren: ()=> import('@app/pages/tickets/owner-tickets/owner-tickets.module').then((m)=> m.OwnerTicketsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }

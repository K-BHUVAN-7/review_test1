import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantTicketsComponent } from './tenant-tickets.component';

const routes: Routes = [
  {
    path: "",
    component: TenantTicketsComponent
  },
  {
    path: "add-tenant-issue",
    loadComponent: ()=> import('@app/pages/tickets/tenant-tickets/add-tenant-issue/add-tenant-issue.component').then((m)=> m.AddTenantIssueComponent)
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantTicketsRoutingModule { }

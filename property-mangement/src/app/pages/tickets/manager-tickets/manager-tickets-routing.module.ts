import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from '@app/pages/manager/manager.component';
import { ManagerTicketsComponent } from './manager-tickets.component';

const routes: Routes = [
  {
    path: "",
    component: ManagerTicketsComponent
  },
  {
    path: "edit-manager-ticket",
    loadComponent: ()=> import('@app/pages/tickets/manager-tickets/edit-manager-tickets/edit-manager-tickets.component').then((m)=> m.EditManagerTicketsComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerTicketsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffTicketsComponent } from './staff-tickets.component';

const routes: Routes = [
  {
    path: "",
    component: StaffTicketsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffTicketsRoutingModule { }

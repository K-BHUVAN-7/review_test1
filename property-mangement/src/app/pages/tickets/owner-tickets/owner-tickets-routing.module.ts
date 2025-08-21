import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerTicketsComponent } from './owner-tickets.component';

const routes: Routes = [
  {
    path: "",
    component: OwnerTicketsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerTicketsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';

const routes: Routes = [

  {
    path:"",
    component:StaffComponent
  },
  {
    path:'create-staff',
    loadComponent : () => import('@app/pages/staff/create-staff/create-staff.component').then((c)=>c.CreateStaffComponent)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }

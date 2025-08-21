import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './roles.component';

const routes: Routes = [

  {
    path:"",
    component:RolesComponent
  },
  {

    path:"create-roles",
    loadComponent : () => import('@app/pages/masters/roles/create-role/create-role.component').then(c => c.CreateRoleComponent)

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }

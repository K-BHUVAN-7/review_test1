import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './manager.component';

const routes: Routes = [

  {
    path:"",
    component:ManagerComponent
  },
  {
    path:"create-manager",
    loadComponent: () => import('@app/pages/manager/create-manager/create-manager.component').then((c) => c.CreateManagerComponent),
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerComponent } from './owner.component';

const routes: Routes = [

  {
    path:"",
    component:OwnerComponent
  },
  {
    path:"create-owner",
    loadComponent : () => import('@app/pages/owner/create-owner/create-owner.component').then(m=>m.CreateOwnerComponent)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OwnerRoutingModule { }

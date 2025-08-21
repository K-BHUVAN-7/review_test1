import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantComponent } from './tenant.component';

let routes: Routes = [
   {
      path:"",
      component:TenantComponent
    },
    {
      path:'create-tenant',
      loadComponent : () => import('@app/pages/tenant/create-tenant/create-tenant.component').then((c)=>c.CreateTenantComponent)
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule { }

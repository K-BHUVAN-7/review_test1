import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MastersComponent } from './masters.component';

const routes: Routes = [

  {
    path:"",
    component:MastersComponent
  },

  {
    path:"property-type",
    loadComponent : () => import('@app/pages/masters/property-type/property-type.component').then(c => c.PropertyTypeComponent)
  },
  {
    path:"id-proofs",
    loadComponent : () => import('@app/pages/masters/id-proof/id-proof.component').then(c => c.IdProofComponent)
  },
  {
    path:"utility",
    loadComponent : () => import('@app/pages/masters/utility/utility.component').then(c=>c.UtilityComponent)
  },
  {
    path:"issues",
    loadComponent : () => import('@app/pages/masters/issues/issues.component').then( c => c.IssuesComponent)
  },
  {
    path:"roles",
    loadChildren : () => import('@app/pages/masters/roles/roles.module').then(m=>m.RolesModule)
  },
  {
    path:"currency",
    loadComponent : () => import('@app/pages/masters/currency/currency.component').then(c=>c.CurrencyComponent)
  },
  {
    path:"tax",
    loadComponent : () => import('@app/pages/masters/tax/tax.component').then(c=>c.TaxComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule { }

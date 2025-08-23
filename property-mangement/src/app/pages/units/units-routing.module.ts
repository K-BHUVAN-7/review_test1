import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitsComponent } from './units.component';

const routes: Routes = [
  {
    path: "",
    component: UnitsComponent
  },
  {
    path:"create-units",
    loadComponent : () => import('@app/pages/units/create-unit/create-unit.component').then(m=>m.CreateUnitComponent)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitsRoutingModule { }

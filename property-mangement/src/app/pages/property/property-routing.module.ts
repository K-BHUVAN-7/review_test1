import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyComponent } from './property.component';
import { CreatePropertyComponent } from './create-property/create-property.component';

let routes: Routes = [

  {
    path: "",
    component: PropertyComponent
  },
  {
    path:"create-property",
    component:CreatePropertyComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyRoutingModule { }

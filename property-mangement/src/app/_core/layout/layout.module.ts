import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    NavBarComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    NavBarComponent,
    SidebarComponent
  ]
})
export class LayoutModule { }

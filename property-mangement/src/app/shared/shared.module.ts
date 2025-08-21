import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { WebcamComponent } from './components/webcam/webcam.component';
import { NumberDirective } from './directives/numbers-only.directive';
import { DecimalNumbersOnlyDirective } from './directives/decimal-numbers-only.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectComponent } from './ng-select/ng-select.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ModalComponent } from './modal/modal.component';

import { ConfirmationDialogService } from './confirmation-dialog/confirmation.service';
import { CommonToastrComponent } from './components/common-toastr/common-toastr.component';
import { CommonService } from './services/common/common.service';



@NgModule({
  declarations: [
    WebcamComponent,
    NgSelectComponent,
    CommonToastrComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxSliderModule,
    NumberDirective,
    DecimalNumbersOnlyDirective,
    NgSelectModule,
    NgOtpInputModule,
    ModalComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxSliderModule,
    WebcamComponent,
    NumberDirective,
    DecimalNumbersOnlyDirective,
    NgSelectModule,
    NgOtpInputModule,
    ModalComponent,
    CommonToastrComponent
  ],
  providers:[
    CommonService,
    ConfirmationDialogService
  ]
})

export class SharedModule { }

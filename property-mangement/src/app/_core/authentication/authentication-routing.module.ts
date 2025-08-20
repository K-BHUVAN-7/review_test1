import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../guard/auth-guard/auth-guard.guard';
import { LoginGuard } from '../guard/login/login.guard';
import { registerGuard } from '../guard/register/register.guard';

const routes: Routes = [
  // {
  //   path: "select-ln",
  //   loadComponent: () => import("@core/authentication/select-language/select-language.component").then(c => c.SelectLanguageComponent)
  // },
  {
    path: "login",
    loadComponent: () => import("@core/authentication/login/login.component").then(c=> c.LoginComponent),
    // canActivate: [authGuard] 
  },
  {
    path:"company-register",
    loadComponent : () => import("@core/authentication/company-register/company-register.component").then(c=>c.CompanyRegisterComponent),
    // canActivate: [registerGuard]
  },
  {
    path:"forget-password",
    loadComponent : () =>import("@core/authentication/forgot-password/forgot-password.component").then(c =>c.ForgotPasswordComponent),
    // canActivate: [AuthGuard]
  },
  {
    path:"verify-otp",
    loadComponent : () =>import("@core/authentication/verify-otp/verify-otp.component").then(c =>c.VerifyOtpComponent),
    // canActivate: [AuthGuard]
  },
  {
    path:"sign-up",
    loadComponent : ()=> import("@core/authentication/sign-up/sign-up.component").then(c=> c.SignUpComponent),
    // canActivate: [LoginGuard]
  },
  // {
  //   path: "validate-mobile",
  //   loadComponent: () => import("@core/authentication/validate-mobile/validate-mobile.component").then(c => c.ValidateMobileComponent)
  // },
  // {
  //   path: "validate-otp",
  //   loadComponent: () => import("@core/authentication/validate-mobile-otp/validate-mobile-otp.component").then(c => c.ValidateMobileOtpComponent),
  //   canActivate: [validateOtpGuard]
  // },
  // {
  //   path: "validate-inn",
  //   loadComponent: () => import("@core/authentication/validate-tin/validate-tin.component").then(c => c.ValidateTinComponent),
  //   canActivate: [validateOtpGuard,validateTinGuard]
  // },
  // {
  //   path: "register",
  //   loadComponent: () => import("@core/authentication/register/register.component").then(c=> c.RegisterComponent),
  //   canActivate: [validateOtpGuard,validateTinGuard,registerGuard]
  // },
  // {
  //   path: "forget-otp",
  //   loadComponent: () => import("@core/authentication/validate-forgot-otp/validate-forgot-otp.component").then(c=>c.ValidateForgotOtpComponent),
  //   canActivate: [validateOtpGuard,validateTinGuard,registerGuard]
  // },
  {
    path: "create-password",
    loadComponent: () => import("@core/authentication/new-password/new-password.component").then(c=>c.NewPasswordComponent),
    // canActivate: [AuthGuard]
    // canActivate: [validateOtpGuard,validateTinGuard,registerGuard,forgetOtpGuard]
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "login"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }

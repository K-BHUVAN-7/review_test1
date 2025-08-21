import { Routes } from '@angular/router';
// import { authGuard } from './_core/guard/auth-guard/auth-guard.guard';
import { LoginGuard } from './_core/guard/login/login.guard';
import { AuthGuard } from './_core/guard/auth-guard/auth-guard.guard';
// import { noAuthGuard } from './_core/guard/no-auth-guard/no-auth-guard.guard'; // optional

export const routes: Routes = [
  {
    path: "auth",
    loadChildren: () =>import("@core/authentication/authentication.module").then(m => m.AuthenticationModule),
    canActivate: [LoginGuard] // Optional: block logged-in users from accessing login
  },
  {
    path: "app",
    loadChildren: () =>import("@app/pages/pages.module").then(m => m.PagesModule),
    canActivate: [AuthGuard] // Protect app for authenticated users
  },
  {
    path: "",
    redirectTo: "auth",
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "auth"
  }
];

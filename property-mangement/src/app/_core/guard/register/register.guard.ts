import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const registerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if(!sessionStorage.getItem("UserDetails")) {
   
     router.navigate(['/auth/login'])

  } else {

     router.navigate(['/auth/company-register'])

  }

  return false;
  
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const validateOtpGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if(!sessionStorage.getItem("mobileNumber")) {
    router.navigate(["/auth/validate-mobile"])
    return false
  }
  return true;
};

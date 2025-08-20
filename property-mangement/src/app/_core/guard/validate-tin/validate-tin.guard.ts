import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const validateTinGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    if(!sessionStorage.getItem("isMobileNumberVerified")) {
      router.navigate(['/auth/validate-otp']);
      return false;
    }
    return true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const forgetOtpGuard: CanActivateFn = (route, state) => {
   const router = inject(Router);
      if(!sessionStorage.getItem("isForgetOtpVerified")) {
        router.navigate(['/auth/forget-otp']);
        return false;
      }
      return true;
};

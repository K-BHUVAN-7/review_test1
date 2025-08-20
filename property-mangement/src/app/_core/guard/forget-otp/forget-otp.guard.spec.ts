import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { forgetOtpGuard } from './forget-otp.guard';

describe('forgetOtpGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => forgetOtpGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

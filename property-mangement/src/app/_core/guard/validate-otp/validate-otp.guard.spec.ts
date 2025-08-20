import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validateOtpGuard } from './validate-otp.guard';

describe('validateOtpGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validateOtpGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

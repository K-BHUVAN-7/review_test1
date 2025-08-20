import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validateTinGuard } from './validate-tin.guard';

describe('validateTinGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validateTinGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

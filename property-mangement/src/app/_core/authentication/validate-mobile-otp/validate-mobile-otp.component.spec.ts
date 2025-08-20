import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateMobileOtpComponent } from './validate-mobile-otp.component';

describe('ValidateMobileOtpComponent', () => {
  let component: ValidateMobileOtpComponent;
  let fixture: ComponentFixture<ValidateMobileOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateMobileOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateMobileOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

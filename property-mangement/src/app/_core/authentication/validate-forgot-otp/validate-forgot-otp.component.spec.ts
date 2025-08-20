import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateForgotOtpComponent } from './validate-forgot-otp.component';

describe('ValidateForgotOtpComponent', () => {
  let component: ValidateForgotOtpComponent;
  let fixture: ComponentFixture<ValidateForgotOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateForgotOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateForgotOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPaymentReverseComponent } from './pay-payment-reverse.component';

describe('PayPaymentReverseComponent', () => {
  let component: PayPaymentReverseComponent;
  let fixture: ComponentFixture<PayPaymentReverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayPaymentReverseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayPaymentReverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

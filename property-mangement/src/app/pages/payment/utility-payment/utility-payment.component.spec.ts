import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityPaymentComponent } from './utility-payment.component';

describe('UtilityPaymentComponent', () => {
  let component: UtilityPaymentComponent;
  let fixture: ComponentFixture<UtilityPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilityPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilityPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

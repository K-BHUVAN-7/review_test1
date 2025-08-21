import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayUtilityAmountComponent } from './pay-utility-amount.component';

describe('PayUtilityAmountComponent', () => {
  let component: PayUtilityAmountComponent;
  let fixture: ComponentFixture<PayUtilityAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayUtilityAmountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayUtilityAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

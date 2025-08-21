import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPropertyTaxComponent } from './pay-property-tax.component';

describe('PayPropertyTaxComponent', () => {
  let component: PayPropertyTaxComponent;
  let fixture: ComponentFixture<PayPropertyTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayPropertyTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayPropertyTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

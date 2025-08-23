import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyTaxBillComponent } from './property-tax-bill.component';

describe('PropertyTaxBillComponent', () => {
  let component: PropertyTaxBillComponent;
  let fixture: ComponentFixture<PropertyTaxBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyTaxBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyTaxBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

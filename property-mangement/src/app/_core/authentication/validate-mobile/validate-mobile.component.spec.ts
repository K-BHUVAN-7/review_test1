import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateMobileComponent } from './validate-mobile.component';

describe('ValidateMobileComponent', () => {
  let component: ValidateMobileComponent;
  let fixture: ComponentFixture<ValidateMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

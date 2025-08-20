import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateTinComponent } from './validate-tin.component';

describe('ValidateTinComponent', () => {
  let component: ValidateTinComponent;
  let fixture: ComponentFixture<ValidateTinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateTinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateTinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

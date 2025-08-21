import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonToastrComponent } from './common-toastr.component';

describe('CommonToastrComponent', () => {
  let component: CommonToastrComponent;
  let fixture: ComponentFixture<CommonToastrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonToastrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonToastrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

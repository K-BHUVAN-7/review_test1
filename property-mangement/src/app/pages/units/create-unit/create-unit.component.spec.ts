import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUnitComponent } from './create-unit.component';

describe('CreateUnitComponent', () => {
  let component: CreateUnitComponent;
  let fixture: ComponentFixture<CreateUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUnitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

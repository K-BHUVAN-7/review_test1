import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffTicketsComponent } from './staff-tickets.component';

describe('StaffTicketsComponent', () => {
  let component: StaffTicketsComponent;
  let fixture: ComponentFixture<StaffTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

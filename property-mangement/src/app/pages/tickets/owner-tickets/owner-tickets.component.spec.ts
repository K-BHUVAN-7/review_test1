import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerTicketsComponent } from './owner-tickets.component';

describe('OwnerTicketsComponent', () => {
  let component: OwnerTicketsComponent;
  let fixture: ComponentFixture<OwnerTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

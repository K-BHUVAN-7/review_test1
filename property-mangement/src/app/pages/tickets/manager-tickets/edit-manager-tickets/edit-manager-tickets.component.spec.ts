import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditManagerTicketsComponent } from './edit-manager-tickets.component';

describe('EditManagerTicketsComponent', () => {
  let component: EditManagerTicketsComponent;
  let fixture: ComponentFixture<EditManagerTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditManagerTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditManagerTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantTicketsComponent } from './tenant-tickets.component';

describe('TenantTicketsComponent', () => {
  let component: TenantTicketsComponent;
  let fixture: ComponentFixture<TenantTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTenantIssueComponent } from './add-tenant-issue.component';

describe('AddTenantIssueComponent', () => {
  let component: AddTenantIssueComponent;
  let fixture: ComponentFixture<AddTenantIssueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTenantIssueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTenantIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

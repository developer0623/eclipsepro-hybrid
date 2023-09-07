import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineDashboardMiniComponent } from './machine-dashboard-mini.component';

describe('MachineDashboardMiniComponent', () => {
  let component: MachineDashboardMiniComponent;
  let fixture: ComponentFixture<MachineDashboardMiniComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MachineDashboardMiniComponent]
    });
    fixture = TestBed.createComponent(MachineDashboardMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

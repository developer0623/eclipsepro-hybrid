import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleSummaryComponent } from './schedule-summary.component';

describe('ScheduleSummaryComponent', () => {
  let component: ScheduleSummaryComponent;
  let fixture: ComponentFixture<ScheduleSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleSummaryComponent]
    });
    fixture = TestBed.createComponent(ScheduleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

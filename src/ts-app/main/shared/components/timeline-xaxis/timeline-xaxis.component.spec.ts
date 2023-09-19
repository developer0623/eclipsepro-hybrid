import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineXAxisComponent } from './timeline-xaxis.component';

describe('TimelineXAxisComponent', () => {
  let component: TimelineXAxisComponent;
  let fixture: ComponentFixture<TimelineXAxisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineXAxisComponent]
    });
    fixture = TestBed.createComponent(TimelineXAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineBlockComponent } from './timeline-block.component';

describe('TimelineBlockComponent', () => {
  let component: TimelineBlockComponent;
  let fixture: ComponentFixture<TimelineBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelineBlockComponent]
    });
    fixture = TestBed.createComponent(TimelineBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricLargeComponent } from './metric-large.component';

describe('MetricLargeComponent', () => {
  let component: MetricLargeComponent;
  let fixture: ComponentFixture<MetricLargeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetricLargeComponent]
    });
    fixture = TestBed.createComponent(MetricLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

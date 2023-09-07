import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunStateIndicatorComponent } from './run-state-indicator.component';

describe('RunStateIndicatorComponent', () => {
  let component: RunStateIndicatorComponent;
  let fixture: ComponentFixture<RunStateIndicatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunStateIndicatorComponent]
    });
    fixture = TestBed.createComponent(RunStateIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

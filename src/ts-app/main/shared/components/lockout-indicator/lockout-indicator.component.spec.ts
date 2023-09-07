import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockoutIndicatorComponent } from './lockout-indicator.component';

describe('LockoutIndicatorComponent', () => {
  let component: LockoutIndicatorComponent;
  let fixture: ComponentFixture<LockoutIndicatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LockoutIndicatorComponent]
    });
    fixture = TestBed.createComponent(LockoutIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

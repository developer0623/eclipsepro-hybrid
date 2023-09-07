import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleCountModeIconComponent } from './hole-count-mode-icon.component';

describe('HoleCountModeIconComponent', () => {
  let component: HoleCountModeIconComponent;
  let fixture: ComponentFixture<HoleCountModeIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HoleCountModeIconComponent]
    });
    fixture = TestBed.createComponent(HoleCountModeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

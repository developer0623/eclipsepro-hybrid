import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotBarComponent } from './snapshot-bar.component';

describe('SnapshotBarComponent', () => {
  let component: SnapshotBarComponent;
  let fixture: ComponentFixture<SnapshotBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SnapshotBarComponent]
    });
    fixture = TestBed.createComponent(SnapshotBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

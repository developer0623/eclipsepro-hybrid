import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineDetailComponent } from './machine-detail.component';

describe('MachineDetailComponent', () => {
  let component: MachineDetailComponent;
  let fixture: ComponentFixture<MachineDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MachineDetailComponent]
    });
    fixture = TestBed.createComponent(MachineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

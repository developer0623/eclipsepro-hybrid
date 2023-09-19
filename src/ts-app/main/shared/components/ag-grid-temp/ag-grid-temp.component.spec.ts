import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridTempComponent } from './ag-grid-temp.component';

describe('AgGridTempComponent', () => {
  let component: AgGridTempComponent;
  let fixture: ComponentFixture<AgGridTempComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgGridTempComponent]
    });
    fixture = TestBed.createComponent(AgGridTempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

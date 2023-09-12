import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParetoComponent } from './pareto.component';

describe('ParetoComponent', () => {
  let component: ParetoComponent;
  let fixture: ComponentFixture<ParetoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParetoComponent]
    });
    fixture = TestBed.createComponent(ParetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

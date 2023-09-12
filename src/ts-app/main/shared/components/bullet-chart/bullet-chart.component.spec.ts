import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulletChartComponent } from './bullet-chart.component';

describe('BulletChartComponent', () => {
  let component: BulletChartComponent;
  let fixture: ComponentFixture<BulletChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulletChartComponent]
    });
    fixture = TestBed.createComponent(BulletChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

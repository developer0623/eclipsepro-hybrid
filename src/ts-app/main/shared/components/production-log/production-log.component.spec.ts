import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionLogComponent } from './production-log.component';

describe('ProductionLogComponent', () => {
  let component: ProductionLogComponent;
  let fixture: ComponentFixture<ProductionLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductionLogComponent]
    });
    fixture = TestBed.createComponent(ProductionLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

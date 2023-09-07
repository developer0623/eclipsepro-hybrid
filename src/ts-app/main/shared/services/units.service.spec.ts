import { TestBed } from '@angular/core/testing';

import { UnitsService } from './units.service';

describe('UnitsServiceService', () => {
  let service: UnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

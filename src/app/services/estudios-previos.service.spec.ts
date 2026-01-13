import { TestBed } from '@angular/core/testing';

import { EstudiosPreviosService } from './estudios-previos.service';

describe('EstudiosPreviosService', () => {
  let service: EstudiosPreviosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstudiosPreviosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

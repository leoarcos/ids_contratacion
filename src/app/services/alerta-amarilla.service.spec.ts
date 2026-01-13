import { TestBed } from '@angular/core/testing';

import { AlertaAmarillaService } from './alerta-amarilla.service';

describe('AlertaAmarillaService', () => {
  let service: AlertaAmarillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertaAmarillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

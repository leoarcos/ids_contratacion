import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActaAprobacionComponent } from './modal-acta-aprobacion.component';

describe('ModalActaAprobacionComponent', () => {
  let component: ModalActaAprobacionComponent;
  let fixture: ComponentFixture<ModalActaAprobacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalActaAprobacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalActaAprobacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

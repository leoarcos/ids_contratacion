import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActaInicioComponent } from './modal-acta-inicio.component';

describe('ModalActaInicioComponent', () => {
  let component: ModalActaInicioComponent;
  let fixture: ComponentFixture<ModalActaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalActaInicioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalActaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

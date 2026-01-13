import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConceptoJueridicoComponent } from './modal-concepto-jueridico.component';

describe('ModalConceptoJueridicoComponent', () => {
  let component: ModalConceptoJueridicoComponent;
  let fixture: ComponentFixture<ModalConceptoJueridicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConceptoJueridicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConceptoJueridicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

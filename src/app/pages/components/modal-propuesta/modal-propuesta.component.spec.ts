import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPropuestaComponent } from './modal-propuesta.component';

describe('ModalPropuestaComponent', () => {
  let component: ModalPropuestaComponent;
  let fixture: ComponentFixture<ModalPropuestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPropuestaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPropuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

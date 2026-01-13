import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClausuladoComponent } from './modal-clausulado.component';

describe('ModalClausuladoComponent', () => {
  let component: ModalClausuladoComponent;
  let fixture: ComponentFixture<ModalClausuladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalClausuladoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalClausuladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

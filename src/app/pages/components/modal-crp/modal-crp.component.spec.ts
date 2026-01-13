import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCRPComponent } from './modal-crp.component';

describe('ModalCRPComponent', () => {
  let component: ModalCRPComponent;
  let fixture: ComponentFixture<ModalCRPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCRPComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCRPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

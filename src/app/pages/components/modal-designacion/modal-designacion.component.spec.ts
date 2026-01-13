import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDesignacionComponent } from './modal-designacion.component';

describe('ModalDesignacionComponent', () => {
  let component: ModalDesignacionComponent;
  let fixture: ComponentFixture<ModalDesignacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDesignacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDesignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

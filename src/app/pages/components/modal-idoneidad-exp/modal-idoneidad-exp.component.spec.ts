import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalIdoneidadExpComponent } from './modal-idoneidad-exp.component';

describe('ModalIdoneidadExpComponent', () => {
  let component: ModalIdoneidadExpComponent;
  let fixture: ComponentFixture<ModalIdoneidadExpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalIdoneidadExpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalIdoneidadExpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

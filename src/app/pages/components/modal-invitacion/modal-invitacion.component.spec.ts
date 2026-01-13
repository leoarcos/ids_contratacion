import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInvitacionComponent } from './modal-invitacion.component';

describe('ModalInvitacionComponent', () => {
  let component: ModalInvitacionComponent;
  let fixture: ComponentFixture<ModalInvitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInvitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalInvitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

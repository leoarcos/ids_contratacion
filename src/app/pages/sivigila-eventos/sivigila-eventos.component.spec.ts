import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SivigilaEventosComponent } from './sivigila-eventos.component';

describe('SivigilaEventosComponent', () => {
  let component: SivigilaEventosComponent;
  let fixture: ComponentFixture<SivigilaEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SivigilaEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SivigilaEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaAmarillaComponent } from './alerta-amarilla.component';

describe('AlertaAmarillaComponent', () => {
  let component: AlertaAmarillaComponent;
  let fixture: ComponentFixture<AlertaAmarillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaAmarillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertaAmarillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

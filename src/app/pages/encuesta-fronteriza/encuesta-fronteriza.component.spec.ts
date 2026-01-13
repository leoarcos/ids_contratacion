import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestaFronterizaComponent } from './encuesta-fronteriza.component';

describe('EncuestaFronterizaComponent', () => {
  let component: EncuestaFronterizaComponent;
  let fixture: ComponentFixture<EncuestaFronterizaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestaFronterizaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncuestaFronterizaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

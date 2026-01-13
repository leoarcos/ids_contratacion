import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstructuradoresComponent } from './estructuradores.component';

describe('EstructuradoresComponent', () => {
  let component: EstructuradoresComponent;
  let fixture: ComponentFixture<EstructuradoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstructuradoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstructuradoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

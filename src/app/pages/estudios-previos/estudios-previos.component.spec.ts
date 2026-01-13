import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosPreviosComponent } from './estudios-previos.component';

describe('EstudiosPreviosComponent', () => {
  let component: EstudiosPreviosComponent;
  let fixture: ComponentFixture<EstudiosPreviosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosPreviosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudiosPreviosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

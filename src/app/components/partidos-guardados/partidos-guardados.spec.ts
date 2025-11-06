import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidosGuardados } from './partidos-guardados';

describe('PartidosGuardados', () => {
  let component: PartidosGuardados;
  let fixture: ComponentFixture<PartidosGuardados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidosGuardados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidosGuardados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidosGuardadosComponent } from './partidos-guardados';

describe('PartidosGuardados', () => {
  let component: PartidosGuardadosComponent;
  let fixture: ComponentFixture<PartidosGuardadosComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidosGuardadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidosGuardadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

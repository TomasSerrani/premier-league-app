import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Necesario porque usas http
import { RouterTestingModule } from '@angular/router/testing'; // Necesario porque usas rutas

// CORRECCIÓN 1: El nombre correcto es PartidoDetalleComponent
import { PartidoDetalleComponent } from './partido-detalle';

describe('PartidoDetalleComponent', () => {
  let component: PartidoDetalleComponent;
  let fixture: ComponentFixture<PartidoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PartidoDetalleComponent, // Usar el nombre correcto
        HttpClientTestingModule, // Agregar para evitar error de "No provider for HttpClient"
        RouterTestingModule      // Agregar para evitar error de rutas
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartidoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
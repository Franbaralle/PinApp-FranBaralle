import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteListComponent } from './cliente-list.component';
import { ClienteService } from '../../services/cliente.service';
import { FormatoFechaNacimientoPipe } from '../../pipes/formato-fecha-nacimiento.pipe';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Cliente } from '../../models/cliente.model';

describe('ClienteListComponent', () => {
  let component: ClienteListComponent;
  let fixture: ComponentFixture<ClienteListComponent>;
  let clienteServiceMock: jasmine.SpyObj<ClienteService>;

  const clientesMock: Cliente[] = [
    {
      id: '1',
      dni: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      edad: 30,
      fechaNacimiento: new Date(1993, 11, 21),
      email: 'juan@example.com'
    },
    {
      id: '2',
      dni: '87654321',
      nombre: 'María',
      apellido: 'González',
      edad: 25,
      fechaNacimiento: new Date(1998, 5, 10),
      email: 'maria@example.com'
    },
    {
      id: '3',
      dni: '11111111',
      nombre: 'Carlos',
      apellido: 'López',
      edad: 40,
      fechaNacimiento: new Date(1983, 2, 15),
      email: 'carlos@example.com'
    }
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ClienteService', ['getClientes', 'deleteCliente']);
    serviceSpy.getClientes.and.returnValue(of(clientesMock));

    await TestBed.configureTestingModule({
      declarations: [ ClienteListComponent, FormatoFechaNacimientoPipe ],
      imports: [ FormsModule ],
      providers: [
        { provide: ClienteService, useValue: serviceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteListComponent);
    component = fixture.componentInstance;
    clienteServiceMock = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load clientes on init', () => {
      component.ngOnInit();
      
      expect(clienteServiceMock.getClientes).toHaveBeenCalled();
      expect(component.todosClientes.length).toBe(3);
    });

    it('should initialize filters with default values', () => {
      expect(component.filtroNombre).toBe('');
      expect(component.filtroEdadMin).toBe('');
      expect(component.filtroEdadMax).toBe('');
    });

    it('should initialize sorting with default values', () => {
      expect(component.ordenActual).toBe('');
      expect(component.ordenAscendente).toBe(true);
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      component.todosClientes = clientesMock;
      component.calcularEstadisticas();
    });

    it('should calculate average age correctly', () => {
      // Edades: 30, 25, 40 -> Promedio: 31.67
      expect(component.promedioEdad).toBeCloseTo(31.67, 1);
    });

    it('should calculate standard deviation correctly', () => {
      // Para las edades 30, 25, 40
      const promedio = (30 + 25 + 40) / 3;
      const varianza = (Math.pow(30 - promedio, 2) + Math.pow(25 - promedio, 2) + Math.pow(40 - promedio, 2)) / 3;
      const desviacionEsperada = Math.sqrt(varianza);
      
      expect(component.desviacionEstandar).toBeCloseTo(desviacionEsperada, 1);
    });

    it('should handle empty list for statistics', () => {
      component.todosClientes = [];
      component.calcularEstadisticas();
      
      expect(component.promedioEdad).toBe(0);
      expect(component.desviacionEstandar).toBe(0);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.todosClientes = clientesMock;
    });

    it('should filter by nombre', () => {
      component.filtroNombre = 'Juan';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].nombre).toBe('Juan');
    });

    it('should filter by apellido', () => {
      component.filtroNombre = 'González';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].apellido).toBe('González');
    });

    it('should be case insensitive', () => {
      component.filtroNombre = 'juan';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].nombre).toBe('Juan');
    });

    it('should filter by minimum age', () => {
      component.filtroEdadMin = '30';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(2); // Juan (30) y Carlos (40)
      expect(component.clientesFiltrados.every(c => c.edad >= 30)).toBeTruthy();
    });

    it('should filter by maximum age', () => {
      component.filtroEdadMax = '30';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(2); // Juan (30) y María (25)
      expect(component.clientesFiltrados.every(c => c.edad <= 30)).toBeTruthy();
    });

    it('should filter by age range', () => {
      component.filtroEdadMin = '25';
      component.filtroEdadMax = '35';
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(2); // Juan (30) y María (25)
      expect(component.clientesFiltrados.every(c => c.edad >= 25 && c.edad <= 35)).toBeTruthy();
    });

    it('should combine multiple filters', () => {
      component.filtroNombre = 'a';
      component.filtroEdadMin = '30';
      component.aplicarFiltros();
      
      // Debe filtrar clientes que contengan 'a' Y tengan edad >= 30
      expect(component.clientesFiltrados.length).toBe(2); // Juan (30) y Carlos (40)
    });

    it('should return all clientes when no filters are applied', () => {
      component.aplicarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(3);
    });
  });

  describe('Clear Filters', () => {
    it('should reset all filters', () => {
      component.filtroNombre = 'Juan';
      component.filtroEdadMin = '25';
      component.filtroEdadMax = '35';
      
      component.limpiarFiltros();
      
      expect(component.filtroNombre).toBe('');
      expect(component.filtroEdadMin).toBe('');
      expect(component.filtroEdadMax).toBe('');
    });

    it('should show all clientes after clearing filters', () => {
      component.todosClientes = clientesMock;
      component.filtroNombre = 'Juan';
      component.aplicarFiltros();
      
      component.limpiarFiltros();
      
      expect(component.clientesFiltrados.length).toBe(3);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.todosClientes = clientesMock;
      component.aplicarFiltros();
    });

    it('should sort by nombre ascending', () => {
      component.ordenarPor('nombre');
      
      expect(component.clientesFiltrados[0].nombre).toBe('Carlos');
      expect(component.clientesFiltrados[1].nombre).toBe('Juan');
      expect(component.clientesFiltrados[2].nombre).toBe('María');
    });

    it('should sort by nombre descending', () => {
      component.ordenarPor('nombre');
      component.ordenarPor('nombre'); // Segunda vez para invertir
      
      expect(component.clientesFiltrados[0].nombre).toBe('María');
      expect(component.clientesFiltrados[1].nombre).toBe('Juan');
      expect(component.clientesFiltrados[2].nombre).toBe('Carlos');
    });

    it('should sort by apellido', () => {
      component.ordenarPor('apellido');
      
      expect(component.clientesFiltrados[0].apellido).toBe('González');
      expect(component.clientesFiltrados[1].apellido).toBe('López');
      expect(component.clientesFiltrados[2].apellido).toBe('Pérez');
    });

    it('should sort by edad', () => {
      component.ordenarPor('edad');
      
      expect(component.clientesFiltrados[0].edad).toBe(25);
      expect(component.clientesFiltrados[1].edad).toBe(30);
      expect(component.clientesFiltrados[2].edad).toBe(40);
    });

    it('should sort by fecha de nacimiento', () => {
      component.ordenarPor('fecha');
      
      // Más viejo primero (1983)
      expect(component.clientesFiltrados[0].nombre).toBe('Carlos');
      // Más joven último (1998)
      expect(component.clientesFiltrados[2].nombre).toBe('María');
    });

    it('should toggle sort direction on same field', () => {
      component.ordenarPor('edad');
      const firstAttempt = component.clientesFiltrados[0].edad;
      
      component.ordenarPor('edad');
      const secondAttempt = component.clientesFiltrados[0].edad;
      
      expect(firstAttempt).not.toBe(secondAttempt);
    });
  });

  describe('Sort Icons', () => {
    it('should return up arrow for ascending sort', () => {
      component.ordenActual = 'nombre';
      component.ordenAscendente = true;
      
      const icon = component.getIconoOrden('nombre');
      expect(icon).toBe('↑');
    });

    it('should return down arrow for descending sort', () => {
      component.ordenActual = 'nombre';
      component.ordenAscendente = false;
      
      const icon = component.getIconoOrden('nombre');
      expect(icon).toBe('↓');
    });

    it('should return empty string for non-sorted column', () => {
      component.ordenActual = 'nombre';
      
      const icon = component.getIconoOrden('edad');
      expect(icon).toBe('');
    });
  });

  describe('Modal Control', () => {
    it('should open modal', () => {
      component.abrirModal();
      
      expect(component.mostrarModal).toBeTruthy();
    });

    it('should close modal', () => {
      component.mostrarModal = true;
      component.cerrarModal();
      
      expect(component.mostrarModal).toBeFalsy();
    });

    it('should reload clientes when cliente is created', () => {
      spyOn(component, 'cargarClientes');
      
      component.onClienteCreado();
      
      expect(component.cargarClientes).toHaveBeenCalled();
      expect(component.mostrarModal).toBeFalsy();
    });
  });

  describe('Delete Cliente', () => {
    it('should call delete service with correct id', () => {
      clienteServiceMock.deleteCliente.and.returnValue(Promise.resolve());
      
      component.eliminarCliente('1');
      
      expect(clienteServiceMock.deleteCliente).toHaveBeenCalledWith('1');
    });

    it('should show confirmation dialog before deleting', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.eliminarCliente('1');
      
      expect(window.confirm).toHaveBeenCalled();
      expect(clienteServiceMock.deleteCliente).not.toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should recalculate statistics after filtering', () => {
      component.todosClientes = clientesMock;
      component.filtroEdadMin = '30';
      
      component.aplicarFiltros();
      
      // Solo Juan (30) y Carlos (40)
      const expectedAverage = (30 + 40) / 2;
      expect(component.promedioEdad).toBe(expectedAverage);
    });

    it('should maintain sort order after filtering', () => {
      component.todosClientes = clientesMock;
      component.ordenarPor('edad');
      component.filtroEdadMin = '25';
      component.aplicarFiltros();
      
      // Debería estar ordenado por edad ascendente
      expect(component.clientesFiltrados[0].edad).toBeLessThanOrEqual(component.clientesFiltrados[1].edad);
    });
  });
});

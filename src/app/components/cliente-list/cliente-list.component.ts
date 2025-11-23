import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.scss']
})
export class ClienteListComponent implements OnInit {
  clientes$: Observable<Cliente[]> | null = null;
  clientesFiltrados: Cliente[] = [];
  todosClientes: Cliente[] = [];
  
  mostrarModal = false;
  
  filtroNombre = '';
  filtroEdadMin = '';
  filtroEdadMax = '';
  
  ordenActual: 'nombre' | 'apellido' | 'edad' | 'fecha' = 'nombre';
  ordenAscendente = true;
  
  promedioEdad = 0;
  desviacionEstandar = 0;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clientes$ = this.clienteService.getClientes();
    this.clientes$.subscribe(clientes => {
      this.todosClientes = clientes;
      this.aplicarFiltros();
      this.calcularEstadisticas();
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.todosClientes];

    if (this.filtroNombre.trim()) {
      const filtro = this.filtroNombre.toLowerCase();
      resultado = resultado.filter(cliente =>
        cliente.nombre.toLowerCase().includes(filtro) ||
        cliente.apellido.toLowerCase().includes(filtro)
      );
    }

    if (this.filtroEdadMin) {
      const edadMin = parseInt(this.filtroEdadMin);
      resultado = resultado.filter(cliente => cliente.edad >= edadMin);
    }

    if (this.filtroEdadMax) {
      const edadMax = parseInt(this.filtroEdadMax);
      resultado = resultado.filter(cliente => cliente.edad <= edadMax);
    }

    this.clientesFiltrados = resultado;
    this.ordenarClientes();
  }

  ordenarPor(criterio: 'nombre' | 'apellido' | 'edad' | 'fecha'): void {
    if (this.ordenActual === criterio) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = criterio;
      this.ordenAscendente = true;
    }
    this.ordenarClientes();
  }

  ordenarClientes(): void {
    this.clientesFiltrados.sort((a, b) => {
      let comparacion = 0;

      switch (this.ordenActual) {
        case 'nombre':
          comparacion = a.nombre.localeCompare(b.nombre);
          break;
        case 'apellido':
          comparacion = a.apellido.localeCompare(b.apellido);
          break;
        case 'edad':
          comparacion = a.edad - b.edad;
          break;
        case 'fecha':
          const fechaA = a.fechaNacimiento instanceof Date ? a.fechaNacimiento : new Date(a.fechaNacimiento);
          const fechaB = b.fechaNacimiento instanceof Date ? b.fechaNacimiento : new Date(b.fechaNacimiento);
          comparacion = fechaA.getTime() - fechaB.getTime();
          break;
      }

      return this.ordenAscendente ? comparacion : -comparacion;
    });
  }

  calcularEstadisticas(): void {
    if (this.todosClientes.length === 0) {
      this.promedioEdad = 0;
      this.desviacionEstandar = 0;
      return;
    }

    const sumaEdades = this.todosClientes.reduce((sum, cliente) => sum + cliente.edad, 0);
    this.promedioEdad = sumaEdades / this.todosClientes.length;

    const varianza = this.todosClientes.reduce((sum, cliente) => {
      const diferencia = cliente.edad - this.promedioEdad;
      return sum + (diferencia * diferencia);
    }, 0) / this.todosClientes.length;

    this.desviacionEstandar = Math.sqrt(varianza);
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroEdadMin = '';
    this.filtroEdadMax = '';
    this.aplicarFiltros();
  }

  async eliminarCliente(id: string | undefined): Promise<void> {
    if (!id) return;
    
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
      try {
        await this.clienteService.deleteCliente(id);
        this.cargarClientes();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  }

  getIconoOrden(campo: string): string {
    if (this.ordenActual !== campo) return '⇅';
    return this.ordenAscendente ? '↑' : '↓';
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onClienteCreado(): void {
    this.cargarClientes();
  }
}

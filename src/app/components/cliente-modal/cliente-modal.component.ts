import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss']
})
export class ClienteModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() clienteCreado = new EventEmitter<void>();

  clienteForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,}$')]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: ['']
    });
  }

  close(): void {
    this.clienteForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.closeModal.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.clienteForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // Verificar si el DNI ya existe
        const dni = this.clienteForm.value.dni;
        const clienteExistente = await this.clienteService.getClienteByDni(dni);
        
        if (clienteExistente) {
          this.errorMessage = `El usuario ${clienteExistente.nombre} ${clienteExistente.apellido} ya fue registrado`;
          this.loading = false;
          return;
        }

        // Crear fecha sin problemas de zona horaria
        const fechaString = this.clienteForm.value.fechaNacimiento;
        const [year, month, day] = fechaString.split('-');
        const fechaNacimiento = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

        const cliente: Cliente = {
          ...this.clienteForm.value,
          fechaNacimiento: fechaNacimiento
        };

        await this.clienteService.addCliente(cliente);
        this.successMessage = 'Cliente registrado exitosamente';
        this.clienteForm.reset();
        
        setTimeout(() => {
          this.clienteCreado.emit();
          this.close();
        }, 1000);
      } catch (error) {
        this.errorMessage = 'Error al registrar el cliente. Por favor, intente nuevamente.';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched(this.clienteForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('pattern') && fieldName === 'dni') {
      return 'El DNI debe tener mínimo 8 números';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `El valor máximo es ${field.errors?.['max'].max}`;
    }
    return '';
  }
}

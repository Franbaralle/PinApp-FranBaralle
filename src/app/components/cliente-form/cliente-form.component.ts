import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: ['']
    });
  }

  ngOnInit(): void {}

  async onSubmit(): Promise<void> {
    if (this.clienteForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const cliente: Cliente = {
          ...this.clienteForm.value,
          fechaNacimiento: new Date(this.clienteForm.value.fechaNacimiento)
        };

        await this.clienteService.addCliente(cliente);
        this.successMessage = 'Cliente registrado exitosamente';
        this.clienteForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/clientes']);
        }, 1500);
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

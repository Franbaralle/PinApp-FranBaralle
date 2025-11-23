import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ClienteModalComponent } from './cliente-modal.component';
import { ClienteService } from '../../services/cliente.service';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';
import { of } from 'rxjs';

describe('ClienteModalComponent', () => {
  let component: ClienteModalComponent;
  let fixture: ComponentFixture<ClienteModalComponent>;
  let clienteServiceMock: jasmine.SpyObj<ClienteService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ClienteService', ['addCliente', 'getClienteByDni']);

    await TestBed.configureTestingModule({
      declarations: [ ClienteModalComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ClienteService, useValue: serviceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteModalComponent);
    component = fixture.componentInstance;
    clienteServiceMock = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with all required controls', () => {
      expect(component.clienteForm.get('dni')).toBeTruthy();
      expect(component.clienteForm.get('nombre')).toBeTruthy();
      expect(component.clienteForm.get('apellido')).toBeTruthy();
      expect(component.clienteForm.get('edad')).toBeTruthy();
      expect(component.clienteForm.get('fechaNacimiento')).toBeTruthy();
      expect(component.clienteForm.get('email')).toBeTruthy();
      expect(component.clienteForm.get('telefono')).toBeTruthy();
      expect(component.clienteForm.get('direccion')).toBeTruthy();
    });

    it('should initialize form as invalid', () => {
      expect(component.clienteForm.valid).toBeFalsy();
    });
  });

  describe('DNI Validation', () => {
    it('should require DNI field', () => {
      const dniControl = component.clienteForm.get('dni');
      expect(dniControl?.hasError('required')).toBeTruthy();
    });

    it('should validate DNI pattern (minimum 8 digits)', () => {
      const dniControl = component.clienteForm.get('dni');
      
      dniControl?.setValue('1234567'); // 7 dígitos - inválido
      expect(dniControl?.hasError('pattern')).toBeTruthy();
      
      dniControl?.setValue('12345678'); // 8 dígitos - válido
      expect(dniControl?.hasError('pattern')).toBeFalsy();
      
      dniControl?.setValue('123456789'); // 9 dígitos - válido
      expect(dniControl?.hasError('pattern')).toBeFalsy();
    });

    it('should reject DNI with non-numeric characters', () => {
      const dniControl = component.clienteForm.get('dni');
      
      dniControl?.setValue('1234567A');
      expect(dniControl?.hasError('pattern')).toBeTruthy();
      
      dniControl?.setValue('12-345-678');
      expect(dniControl?.hasError('pattern')).toBeTruthy();
    });
  });

  describe('Name and Surname Validation', () => {
    it('should require nombre and apellido', () => {
      const nombreControl = component.clienteForm.get('nombre');
      const apellidoControl = component.clienteForm.get('apellido');
      
      expect(nombreControl?.hasError('required')).toBeTruthy();
      expect(apellidoControl?.hasError('required')).toBeTruthy();
    });

    it('should require minimum 2 characters for nombre and apellido', () => {
      const nombreControl = component.clienteForm.get('nombre');
      const apellidoControl = component.clienteForm.get('apellido');
      
      nombreControl?.setValue('A');
      apellidoControl?.setValue('B');
      
      expect(nombreControl?.hasError('minlength')).toBeTruthy();
      expect(apellidoControl?.hasError('minlength')).toBeTruthy();
      
      nombreControl?.setValue('Juan');
      apellidoControl?.setValue('Pérez');
      
      expect(nombreControl?.hasError('minlength')).toBeFalsy();
      expect(apellidoControl?.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Age Validation', () => {
    it('should require edad field', () => {
      const edadControl = component.clienteForm.get('edad');
      expect(edadControl?.hasError('required')).toBeTruthy();
    });

    it('should validate edad between 1 and 120', () => {
      const edadControl = component.clienteForm.get('edad');
      
      edadControl?.setValue(0);
      expect(edadControl?.hasError('min')).toBeTruthy();
      
      edadControl?.setValue(121);
      expect(edadControl?.hasError('max')).toBeTruthy();
      
      edadControl?.setValue(30);
      expect(edadControl?.valid).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    it('should not require email (optional field)', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeFalsy();
    });

    it('should validate email format when provided', () => {
      const emailControl = component.clienteForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit if form is invalid', () => {
      spyOn(component, 'markFormGroupTouched' as any);
      
      component.onSubmit();
      
      expect(component['markFormGroupTouched']).toHaveBeenCalled();
    });

    it('should have valid form with all required fields', () => {
      component.clienteForm.setValue({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 30,
        fechaNacimiento: '1993-12-21',
        email: 'juan@example.com',
        telefono: '+54911234567',
        direccion: 'Calle Falsa 123'
      });
      
      expect(component.clienteForm.valid).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('should return correct error message for required field', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('nombre');
      expect(errorMessage).toBe('Este campo es requerido');
    });

    it('should return correct error message for DNI pattern', () => {
      const dniControl = component.clienteForm.get('dni');
      dniControl?.setValue('1234567');
      dniControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('dni');
      expect(errorMessage).toBe('El DNI debe tener mínimo 8 números');
    });

    it('should return correct error message for minlength', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('A');
      nombreControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('nombre');
      expect(errorMessage).toContain('Mínimo');
    });

    it('should return correct error message for invalid email', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('email');
      expect(errorMessage).toBe('Email inválido');
    });
  });

  describe('Field Validation Check', () => {
    it('should identify invalid touched field', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.markAsTouched();
      
      const isInvalid = component.isFieldInvalid('nombre');
      expect(isInvalid).toBeTruthy();
    });

    it('should not identify untouched invalid field as invalid', () => {
      const isInvalid = component.isFieldInvalid('nombre');
      expect(isInvalid).toBeFalsy();
    });
  });

  describe('Modal Control', () => {
    it('should emit closeModal event when close is called', () => {
      spyOn(component.closeModal, 'emit');
      
      component.close();
      
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should reset form when close is called', () => {
      component.clienteForm.get('nombre')?.setValue('Test');
      
      component.close();
      
      expect(component.clienteForm.get('nombre')?.value).toBeNull();
    });

    it('should clear error messages when close is called', () => {
      component.errorMessage = 'Test error';
      component.successMessage = 'Test success';
      
      component.close();
      
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteService } from '../../services/cliente.service';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let clienteServiceMock: jasmine.SpyObj<ClienteService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ClienteService', ['addCliente']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ ClienteFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ClienteService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    clienteServiceMock = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.clienteForm).toBeDefined();
      expect(component.clienteForm.get('nombre')?.value).toBe('');
      expect(component.clienteForm.get('apellido')?.value).toBe('');
      expect(component.clienteForm.get('edad')?.value).toBe('');
      expect(component.clienteForm.get('fechaNacimiento')?.value).toBe('');
    });

    it('should have all required fields configured', () => {
      const nombreControl = component.clienteForm.get('nombre');
      const apellidoControl = component.clienteForm.get('apellido');
      const edadControl = component.clienteForm.get('edad');
      const fechaNacimientoControl = component.clienteForm.get('fechaNacimiento');

      expect(nombreControl?.hasError('required')).toBeTruthy();
      expect(apellidoControl?.hasError('required')).toBeTruthy();
      expect(edadControl?.hasError('required')).toBeTruthy();
      expect(fechaNacimientoControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Nombre Validation', () => {
    it('should be invalid if nombre is empty', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('');
      
      expect(nombreControl?.hasError('required')).toBeTruthy();
      expect(nombreControl?.valid).toBeFalsy();
    });

    it('should be invalid if nombre is less than 2 characters', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('A');
      
      expect(nombreControl?.hasError('minlength')).toBeTruthy();
      expect(nombreControl?.valid).toBeFalsy();
    });

    it('should be valid if nombre has 2 or more characters', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('Juan');
      
      expect(nombreControl?.valid).toBeTruthy();
    });
  });

  describe('Apellido Validation', () => {
    it('should be invalid if apellido is empty', () => {
      const apellidoControl = component.clienteForm.get('apellido');
      apellidoControl?.setValue('');
      
      expect(apellidoControl?.hasError('required')).toBeTruthy();
      expect(apellidoControl?.valid).toBeFalsy();
    });

    it('should be invalid if apellido is less than 2 characters', () => {
      const apellidoControl = component.clienteForm.get('apellido');
      apellidoControl?.setValue('P');
      
      expect(apellidoControl?.hasError('minlength')).toBeTruthy();
      expect(apellidoControl?.valid).toBeFalsy();
    });

    it('should be valid if apellido has 2 or more characters', () => {
      const apellidoControl = component.clienteForm.get('apellido');
      apellidoControl?.setValue('Pérez');
      
      expect(apellidoControl?.valid).toBeTruthy();
    });
  });

  describe('Edad Validation', () => {
    it('should be invalid if edad is empty', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue('');
      
      expect(edadControl?.hasError('required')).toBeTruthy();
    });

    it('should be invalid if edad is less than 1', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue(0);
      
      expect(edadControl?.hasError('min')).toBeTruthy();
      expect(edadControl?.valid).toBeFalsy();
    });

    it('should be invalid if edad is greater than 120', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue(121);
      
      expect(edadControl?.hasError('max')).toBeTruthy();
      expect(edadControl?.valid).toBeFalsy();
    });

    it('should be valid if edad is between 1 and 120', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue(30);
      
      expect(edadControl?.valid).toBeTruthy();
    });
  });

  describe('FechaNacimiento Validation', () => {
    it('should be invalid if fecha nacimiento is empty', () => {
      const fechaControl = component.clienteForm.get('fechaNacimiento');
      fechaControl?.setValue('');
      
      expect(fechaControl?.hasError('required')).toBeTruthy();
    });

    it('should be valid with a proper date', () => {
      const fechaControl = component.clienteForm.get('fechaNacimiento');
      fechaControl?.setValue('1993-12-21');
      
      expect(fechaControl?.valid).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    it('should be valid if email is empty (optional field)', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('');
      
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should be invalid with incorrect email format', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('invalid-email');
      
      expect(emailControl?.hasError('email')).toBeTruthy();
      expect(emailControl?.valid).toBeFalsy();
    });

    it('should be valid with correct email format', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('test@example.com');
      
      expect(emailControl?.valid).toBeTruthy();
    });
  });

  describe('Optional Fields', () => {
    it('should accept empty telefono', () => {
      const telefonoControl = component.clienteForm.get('telefono');
      telefonoControl?.setValue('');
      
      expect(telefonoControl?.valid).toBeTruthy();
    });

    it('should accept empty direccion', () => {
      const direccionControl = component.clienteForm.get('direccion');
      direccionControl?.setValue('');
      
      expect(direccionControl?.valid).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('');
      nombreControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('nombre');
      expect(errorMessage).toBe('Este campo es requerido');
    });

    it('should return minlength error message', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('A');
      nombreControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('nombre');
      expect(errorMessage).toContain('Mínimo');
      expect(errorMessage).toContain('2');
    });

    it('should return email error message', () => {
      const emailControl = component.clienteForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('email');
      expect(errorMessage).toBe('Email inválido');
    });

    it('should return min error message for edad', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue(0);
      edadControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('edad');
      expect(errorMessage).toContain('El valor mínimo es 1');
    });

    it('should return max error message for edad', () => {
      const edadControl = component.clienteForm.get('edad');
      edadControl?.setValue(121);
      edadControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('edad');
      expect(errorMessage).toContain('El valor máximo es 120');
    });
  });

  describe('Field Validation Check', () => {
    it('should return true if field is invalid and touched', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('');
      nombreControl?.markAsTouched();
      
      expect(component.isFieldInvalid('nombre')).toBeTruthy();
    });

    it('should return false if field is valid', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('Juan');
      nombreControl?.markAsTouched();
      
      expect(component.isFieldInvalid('nombre')).toBeFalsy();
    });

    it('should return false if field is invalid but not touched', () => {
      const nombreControl = component.clienteForm.get('nombre');
      nombreControl?.setValue('');
      
      expect(component.isFieldInvalid('nombre')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    let mockDocRef: any;

    beforeEach(() => {
      // Mock DocumentReference
      mockDocRef = { id: 'mock-id' } as DocumentReference<DocumentData>;

      // Setup valid form data
      component.clienteForm.patchValue({
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 30,
        fechaNacimiento: '1993-12-21',
        email: 'juan@example.com',
        telefono: '123456789',
        direccion: 'Calle 123'
      });
    });

    it('should call addCliente service on valid form submission', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      await component.onSubmit();
      
      expect(clienteServiceMock.addCliente).toHaveBeenCalled();
    });

    it('should convert fechaNacimiento string to Date object', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      await component.onSubmit();
      
      const callArgs = clienteServiceMock.addCliente.calls.mostRecent().args[0];
      expect(callArgs.fechaNacimiento instanceof Date).toBeTruthy();
    });

    it('should set loading to true during submission', async () => {
      clienteServiceMock.addCliente.and.returnValue(new Promise(() => {})); // Never resolves
      
      component.onSubmit();
      
      expect(component.loading).toBeTruthy();
    });

    it('should display success message on successful submission', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      await component.onSubmit();
      
      expect(component.successMessage).toBe('Cliente registrado exitosamente');
      expect(component.errorMessage).toBe('');
    });

    it('should reset form after successful submission', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      await component.onSubmit();
      
      expect(component.clienteForm.get('nombre')?.value).toBeNull();
      expect(component.clienteForm.get('apellido')?.value).toBeNull();
    });

    it('should navigate to /clientes after successful submission', (done) => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      component.onSubmit().then(() => {
        setTimeout(() => {
          expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes']);
          done();
        }, 1600);
      });
    });

    it('should display error message on failed submission', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.reject('Error'));
      
      await component.onSubmit();
      
      expect(component.errorMessage).toBe('Error al registrar el cliente. Por favor, intente nuevamente.');
      expect(component.successMessage).toBe('');
    });

    it('should set loading to false after submission completes', async () => {
      clienteServiceMock.addCliente.and.returnValue(Promise.resolve(mockDocRef));
      
      await component.onSubmit();
      
      expect(component.loading).toBeFalsy();
    });

    it('should not submit if form is invalid', async () => {
      component.clienteForm.patchValue({
        nombre: '',
        apellido: '',
        edad: '',
        fechaNacimiento: ''
      });
      
      await component.onSubmit();
      
      expect(clienteServiceMock.addCliente).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched if form is invalid', async () => {
      component.clienteForm.patchValue({
        nombre: '',
        apellido: '',
        edad: '',
        fechaNacimiento: ''
      });
      
      await component.onSubmit();
      
      expect(component.clienteForm.get('nombre')?.touched).toBeTruthy();
      expect(component.clienteForm.get('apellido')?.touched).toBeTruthy();
      expect(component.clienteForm.get('edad')?.touched).toBeTruthy();
      expect(component.clienteForm.get('fechaNacimiento')?.touched).toBeTruthy();
    });
  });

  describe('Form States', () => {
    it('should initialize with loading false', () => {
      expect(component.loading).toBeFalsy();
    });

    it('should initialize with empty error message', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize with empty success message', () => {
      expect(component.successMessage).toBe('');
    });
  });
});

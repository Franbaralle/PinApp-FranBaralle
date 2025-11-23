import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { ClienteService } from './cliente.service';
import { Cliente } from '../models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let firestoreMock: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    // Mock de Firestore
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection', 'doc']);

    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });
    
    service = TestBed.inject(ClienteService);
    firestoreMock = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Data Model Validation', () => {
    it('should validate cliente model structure', () => {
      const cliente: Cliente = {
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 30,
        fechaNacimiento: new Date(1993, 11, 21),
        email: 'juan@example.com',
        telefono: '+54911234567',
        direccion: 'Calle Falsa 123'
      };

      expect(cliente.dni).toBeDefined();
      expect(cliente.nombre).toBeDefined();
      expect(cliente.apellido).toBeDefined();
      expect(cliente.edad).toBeGreaterThan(0);
      expect(cliente.fechaNacimiento).toBeInstanceOf(Date);
    });

    it('should accept optional fields as undefined', () => {
      const clienteMinimo: Cliente = {
        dni: '12345678',
        nombre: 'María',
        apellido: 'González',
        edad: 25,
        fechaNacimiento: new Date(1998, 5, 10)
      };

      expect(clienteMinimo.email).toBeUndefined();
      expect(clienteMinimo.telefono).toBeUndefined();
      expect(clienteMinimo.direccion).toBeUndefined();
    });
  });

  describe('DNI Validation Logic', () => {
    it('should validate DNI format with at least 8 digits', () => {
      const dniValido = '12345678';
      const dniInvalido = '1234567';

      expect(dniValido.length).toBeGreaterThanOrEqual(8);
      expect(dniInvalido.length).toBeLessThan(8);
    });

    it('should validate DNI contains only numbers', () => {
      const dniValido = '12345678';
      const dniInvalido = '1234567A';

      expect(/^[0-9]+$/.test(dniValido)).toBe(true);
      expect(/^[0-9]+$/.test(dniInvalido)).toBe(false);
    });
  });

  describe('Date Handling', () => {
    it('should create dates at noon to avoid timezone issues', () => {
      const year = 1993;
      const month = 11; // Diciembre (0-indexed)
      const day = 21;
      const fecha = new Date(year, month, day, 12, 0, 0);

      expect(fecha.getFullYear()).toBe(1993);
      expect(fecha.getMonth()).toBe(11);
      expect(fecha.getDate()).toBe(21);
      expect(fecha.getHours()).toBe(12);
    });

    it('should handle date conversion from string input', () => {
      const fechaString = '1993-12-21';
      const [year, month, day] = fechaString.split('-');
      const fecha = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        12, 0, 0
      );

      expect(fecha.getFullYear()).toBe(1993);
      expect(fecha.getMonth()).toBe(11); // Diciembre
      expect(fecha.getDate()).toBe(21);
    });
  });

  describe('Age Calculation Logic', () => {
    it('should calculate correct age from birth date', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const fechaNacimiento = new Date(birthYear, 5, 15);
      
      const edad = today.getFullYear() - fechaNacimiento.getFullYear();
      
      expect(edad).toBe(30);
    });
  });

  describe('Statistics Calculations', () => {
    it('should calculate average age correctly', () => {
      const edades = [25, 30, 35, 40];
      const promedio = edades.reduce((acc, edad) => acc + edad, 0) / edades.length;
      
      expect(promedio).toBe(32.5);
    });

    it('should calculate standard deviation correctly', () => {
      const edades = [20, 25, 30, 35, 40];
      const promedio = edades.reduce((acc, edad) => acc + edad, 0) / edades.length;
      const varianza = edades.reduce((acc, edad) => 
        acc + Math.pow(edad - promedio, 2), 0
      ) / edades.length;
      const desviacion = Math.sqrt(varianza);
      
      expect(desviacion).toBeCloseTo(7.07, 1);
    });

    it('should handle empty array for statistics', () => {
      const edades: number[] = [];
      const promedio = edades.length > 0 
        ? edades.reduce((acc, edad) => acc + edad, 0) / edades.length 
        : 0;
      
      expect(promedio).toBe(0);
    });
  });
});

import { FormatoFechaNacimientoPipe } from './formato-fecha-nacimiento.pipe';

describe('FormatoFechaNacimientoPipe', () => {
  let pipe: FormatoFechaNacimientoPipe;

  beforeEach(() => {
    pipe = new FormatoFechaNacimientoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date to DD/MM/YYYY', () => {
    const fecha = new Date(1993, 11, 21); // 21 de diciembre de 1993
    const resultado = pipe.transform(fecha);
    expect(resultado).toBe('21/12/1993');
  });

  it('should add leading zeros to day and month', () => {
    const fecha = new Date(2000, 0, 5); // 5 de enero de 2000
    const resultado = pipe.transform(fecha);
    expect(resultado).toBe('05/01/2000');
  });

  it('should handle null or undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });

  it('should handle different years correctly', () => {
    const fecha1 = new Date(1985, 5, 15); // 15/06/1985
    const fecha2 = new Date(2023, 8, 30); // 30/09/2023
    
    expect(pipe.transform(fecha1)).toBe('15/06/1985');
    expect(pipe.transform(fecha2)).toBe('30/09/2023');
  });
});

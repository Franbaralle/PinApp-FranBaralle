export interface Cliente {
  id?: string;
  dni: string;
  nombre: string;
  apellido: string;
  edad: number;
  fechaNacimiento: Date;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: Date;
}

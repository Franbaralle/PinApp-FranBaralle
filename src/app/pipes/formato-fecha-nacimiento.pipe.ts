import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFechaNacimiento'
})
export class FormatoFechaNacimientoPipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) return '';

    const fecha = value instanceof Date ? value : new Date(value);
    
    if (isNaN(fecha.getTime())) return '';

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}

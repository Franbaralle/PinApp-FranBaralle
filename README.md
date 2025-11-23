# PINApp - Sistema de Gestión de Clientes

Aplicación web para la gestión de clientes con análisis estadístico en tiempo real.

## Inicio Rápido

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar la aplicación:
```bash
ng serve
```

3. Abrir en el navegador: `http://localhost:4200/`

## Cómo Usar

### Agregar un Cliente

1. Haz clic en el botón **"+ Nuevo Cliente"**
2. Completa el formulario en el popup:
   - **DNI** (obligatorio)
   - **Nombre** (obligatorio)
   - **Apellido** (obligatorio)
   - **Edad** (obligatorio, 0-120 años)
   - **Fecha de Nacimiento** (obligatorio)
   - Email (opcional)
   - Teléfono (opcional)
   - Dirección (opcional)
3. Haz clic en **"Registrar"**
4. El cliente aparecerá automáticamente en la lista

### Filtrar Clientes

Usa los filtros disponibles:
- **Buscar por Nombre/Apellido**: Escribe para filtrar en tiempo real
- **Edad Mínima/Máxima**: Define un rango de edades
- **Limpiar Filtros**: Restaura la vista completa

### Ordenar la Lista

Haz clic en los encabezados de la tabla para ordenar por:
- Nombre
- Apellido
- Edad
- Fecha de Nacimiento

### Eliminar un Cliente

Haz clic en el ícono del cesto de basura en la fila del cliente que deseas eliminar.

## Estadísticas

La aplicación muestra automáticamente:
- **Total de Clientes**: Cantidad registrada
- **Promedio de Edad**: Edad promedio de todos los clientes
- **Desviación Estándar**: Variabilidad de las edades

## Configuración de Firebase

Si necesitas cambiar la configuración de Firebase:

1. Edita `src/environments/environment.ts`
2. Actualiza las credenciales en `firebaseConfig`
3. Reinicia el servidor de desarrollo

## Tecnologías

- Angular 15
- Firebase Firestore
- TypeScript
- SCSS

- Angular 15
- Firebase 9
- AngularFire 7.5
- TypeScript
- RxJS

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


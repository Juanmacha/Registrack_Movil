/* eslint-disable @typescript-eslint/naming-convention */

// Estados terminales que se excluyen de "en proceso"
export const ESTADOS_TERMINALES = ['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'] as const;

// Tipos de servicio disponibles
export type TipoServicio =
  | 'Búsqueda de Antecedentes'
  | 'Certificación de Marca'
  | 'Renovación de Marca'
  | 'Presentación de Oposición'
  | 'Cesión de Marca'
  | 'Ampliación de Alcance'
  | 'Respuesta a Oposición';

// Estructura de respuesta de la API (raw)
export interface SolicitudAPI {
  id?: number;
  id_orden_servicio: number;
  id_cliente: number;
  id_servicio: number;
  id_empleado_asignado?: number | null;
  estado: string;
  estado_actual?: string;
  expediente?: string;
  nombre_solicitante?: string;
  marca_a_buscar?: string;
  nombre_marca?: string;
  correo_electronico?: string;
  email?: string;
  telefono?: string;
  fecha_solicitud?: string;
  fecha_creacion?: string;
  updatedAt?: string;
  servicio?: {
    id: number;
    nombre: string;
  };
  empleado_asignado?: {
    id_empleado: number;
    nombres: string;
    apellidos: string;
  } | null;
  cliente?: {
    id_cliente: number;
    nombre: string;
    apellido: string;
  };
}

// Estructura transformada para el frontend
export interface Solicitud {
  id: string;
  id_orden_servicio: number;
  expediente: string;
  titular: string;
  marca: string;
  tipoSolicitud: string;
  encargado: string;
  estado: string;
  email: string;
  telefono?: string;
  fechaCreacion: string;
  fechaSolicitud?: string;
  id_cliente: number;
  id_empleado_asignado?: number | null;
  clienteCompleto?: SolicitudAPI['cliente'];
  empleadoCompleto?: SolicitudAPI['empleado_asignado'];
  servicioCompleto?: SolicitudAPI['servicio'];
}

// Cliente para selector
export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  tipo_documento?: string;
  tipo_persona?: string;
}

// Empleado para asignación
export interface Empleado {
  id_empleado: number;
  nombres: string;
  apellidos: string;
  correo: string;
  estado_empleado: boolean | number;
  telefono?: string;
}

// Servicio
export interface Servicio {
  id?: number;
  id_servicio?: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  activo?: boolean;
}

// Detalle completo de solicitud
export interface SolicitudDetalle extends SolicitudAPI {
  // Todos los campos adicionales que vienen en el detalle
  pais?: string;
  ciudad?: string;
  tipodepersona?: string;
  tipodedocumento?: string;
  numerodedocumento?: string;
  nombrecompleto?: string;
  correoelectronico?: string;
  direccion?: string;
  nombredelamarca?: string;
  tipo_producto_servicio?: string;
  motivo_anulacion?: string;
  fecha_anulacion?: string;
}

// Estados disponibles
export interface EstadosDisponiblesResponse {
  success?: boolean;
  data?: {
    estado_actual: string;
    estados_disponibles: string[];
  };
  estado_actual?: string;
  estados_disponibles?: string[];
}

// Seguimiento
export interface Seguimiento {
  id_seguimiento: number;
  id_orden_servicio: number;
  titulo: string;
  descripcion: string;
  observaciones?: string;
  nuevo_estado?: string;
  estado_anterior?: string;
  fecha: string;
  fecha_registro?: string;
  usuario?: string;
  usuario_registro?: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  documentos_adjuntos?: Record<string, string>;
}

// Payload para crear solicitud
export interface CrearSolicitudPayload {
  id_cliente: number; // OBLIGATORIO para admin
  pais?: string;
  ciudad?: string;
  tipodepersona?: string;
  tipodedocumento?: string;
  numerodedocumento?: string;
  nombres_apellidos?: string;
  nombrecompleto?: string;
  correoelectronico?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  nombredelamarca?: string;
  nombre_a_buscar?: string;
  tipo_producto_servicio?: string;
  logotipo?: string; // base64 con prefijo data:
  poderparaelregistrodelamarca?: string;
  poder_autorizacion?: string;
  certificado_camara_comercio?: string;
  tipodeentidadrazonsocial?: string;
  nombredelaempresa?: string;
  nit?: string;
  poderdelrepresentanteautorizado?: string;
  tipo_solicitante?: string;
  [key: string]: any; // Para campos adicionales según tipo de servicio
}

// Payload para editar solicitud
export interface EditarSolicitudPayload {
  pais?: string;
  ciudad?: string;
  tipodepersona?: string;
  tipodedocumento?: string;
  numerodedocumento?: string;
  nombrecompleto?: string;
  correoelectronico?: string;
  telefono?: string;
  direccion?: string;
  tipodeentidadrazonsocial?: string;
  nombredelaempresa?: string;
  nit?: string;
  poderdelrepresentanteautorizado?: string;
  poderparaelregistrodelamarca?: string;
}

// Payload para anular solicitud
export interface AnularSolicitudPayload {
  motivo: string;
}

// Payload para asignar empleado
export interface AsignarEmpleadoPayload {
  id_empleado: number;
}

// Payload para crear seguimiento
export interface CrearSeguimientoPayload {
  id_orden_servicio: number;
  titulo: string; // Requerido, máx 200 caracteres
  descripcion: string; // Requerido
  observaciones?: string;
  nuevo_proceso?: string; // Nombre exacto del estado
  documentos_adjuntos?: Record<string, string>; // {"nombre_archivo": "data:application/pdf;base64,..."}
}

// Respuesta de creación
export interface CrearSolicitudResponse {
  success: boolean;
  mensaje?: string;
  message?: string;
  data?: {
    id_orden_servicio: number;
    estado: string;
    id_cliente: number;
    id_servicio: number;
  };
}

// Respuesta de empleado asignado
export interface EmpleadoAsignadoResponse {
  success?: boolean;
  data?: {
    id_empleado: number;
    nombre?: string;
    nombres?: string;
    apellidos?: string;
    correo: string;
    estado_empleado: boolean;
  };
}


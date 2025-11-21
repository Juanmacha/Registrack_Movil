export type PeriodoValue = '1mes' | '3meses' | '6meses' | '12meses' | '18meses' | '2anos' | '3anos' | '5anos' | 'todo';

export interface Periodo {
  label: string;
  value: PeriodoValue;
}

export interface IngresoPorServicio {
  nombre: string;
  ingresos: number;
}

export interface IngresoPorMes {
  mes: string;
  total: number;
  servicios: Array<{ nombre: string; ingresos: number }>;
}

export interface DashboardIngresosResponse {
  success: boolean;
  data: {
    total_ingresos: number;
    periodo: string;
    ingresos_por_servicio: IngresoPorServicio[];
    ingresos_por_mes: IngresoPorMes[];
  };
}

export interface EstadoDistribucion {
  [estado: string]: number;
}

export interface ServicioResumen {
  id_servicio: number;
  nombre: string;
  total_solicitudes: number;
  porcentaje_uso: number;
  precio_base: number;
  estado_distribucion: EstadoDistribucion;
}

export interface DashboardServiciosResponse {
  success: boolean;
  data: {
    total_servicios: number;
    total_solicitudes: number;
    periodo: string;
    servicios: ServicioResumen[];
  };
}

export interface ClienteInfo {
  id_cliente: number;
  usuario: {
    nombre: string;
    apellido: string;
  };
}

export interface EmpleadoInfo {
  id_empleado: number;
  usuario: {
    nombre: string;
    apellido: string;
  };
}

export interface MarcaCertificada {
  id: number;
  nombre_marca: string;
  cliente: ClienteInfo | string;
  empleado: EmpleadoInfo | string | null;
  fecha_certificacion: string;
  fecha_vencimiento: string;
  dias_restantes: number;
  estado: string;
}

export interface DashboardRenovacionesResponse {
  success: boolean;
  total: number;
  dias_anticipacion: number;
  por_urgencia: {
    critico: number;
    alto: number;
    medio: number;
    bajo: number;
  };
  renovaciones: MarcaCertificada[];
  data?: MarcaCertificada[]; // Para compatibilidad con formato anterior
}

export interface ServicioInactivo {
  id: number;
  id_orden_servicio: number;
  nombre_servicio: string;
  cliente: string | ClienteInfo;
  empleado_asignado: string | EmpleadoInfo | null;
  estado: string;
  dias_inactivos: number;
  fecha_ultima_actualizacion: string;
}

export interface DashboardInactivasResponse {
  success: boolean;
  data: ServicioInactivo[];
}


import axios, { AxiosInstance } from 'axios';

import { API_CONFIG } from '@/constants/api';
import { manejarErrorAPI } from '@/utils/apiError';
import {
  SolicitudAPI,
  Solicitud,
  Cliente,
  Empleado,
  Servicio,
  SolicitudDetalle,
  EstadosDisponiblesResponse,
  Seguimiento,
  CrearSolicitudPayload,
  EditarSolicitudPayload,
  AnularSolicitudPayload,
  AsignarEmpleadoPayload,
  CrearSeguimientoPayload,
  CrearSolicitudResponse,
  EmpleadoAsignadoResponse,
  ESTADOS_TERMINALES,
} from '@/types/solicitudes';

// Crear instancia compartida que se actualizará con el token
let apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.defaultHeaders,
});

// Función para actualizar el token en el cliente
export const setSolicitudesAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

// Transformar respuesta de API a formato frontend
const transformarRespuestaDelAPI = (solicitud: SolicitudAPI): Solicitud | null => {
  // Validar que tenga id_orden_servicio
  if (!solicitud.id_orden_servicio && !solicitud.id) {
    console.warn('Solicitud sin ID válido:', solicitud);
    return null;
  }

  const idOrdenServicio = solicitud.id_orden_servicio || solicitud.id || 0;
  const id = idOrdenServicio.toString();
  const expediente = solicitud.expediente || `EXP-${id}`;
  
  // Obtener titular de múltiples fuentes posibles
  const titular =
    solicitud.nombre_solicitante ||
    (solicitud.cliente ? `${solicitud.cliente.nombre || ''} ${solicitud.cliente.apellido || ''}`.trim() : '') ||
    'Sin titular';
  
  // Obtener marca de múltiples fuentes posibles
  const marca = solicitud.marca_a_buscar || solicitud.nombre_marca || 'Sin marca';
  
  // Obtener tipo de solicitud
  const tipoSolicitud = solicitud.servicio?.nombre || 'Sin servicio';
  
  // Obtener encargado
  const encargado = solicitud.empleado_asignado
    ? `${solicitud.empleado_asignado.nombres || ''} ${solicitud.empleado_asignado.apellidos || ''}`.trim()
    : 'Sin asignar';
  
  // Obtener email
  const email = solicitud.correo_electronico || solicitud.email || '';
  
  // Obtener fecha
  const fechaCreacion = solicitud.fecha_creacion || solicitud.fecha_solicitud || '';
  const fechaSolicitud = solicitud.fecha_solicitud || solicitud.updatedAt || '';

  return {
    id,
    id_orden_servicio: idOrdenServicio,
    expediente,
    titular,
    marca,
    tipoSolicitud,
    encargado,
    estado: solicitud.estado || solicitud.estado_actual || 'Sin estado',
    email,
    telefono: solicitud.telefono,
    fechaCreacion,
    fechaSolicitud,
    id_cliente: solicitud.id_cliente || 0,
    id_empleado_asignado: solicitud.id_empleado_asignado,
    clienteCompleto: solicitud.cliente,
    empleadoCompleto: solicitud.empleado_asignado,
    servicioCompleto: solicitud.servicio,
  };
};

export const solicitudesApiService = {
  // Obtener todas las solicitudes
  async getAllSolicitudes(): Promise<Solicitud[]> {
    try {
      const response = await apiClient.get<any[]>('/gestion-solicitudes');
      console.log('🔍 DEBUG SOLICITUDES - Respuesta completa:', JSON.stringify(response.data, null, 2));
      
      const solicitudes = Array.isArray(response.data) ? response.data : [];
      console.log('🔍 DEBUG SOLICITUDES - Total solicitudes:', solicitudes.length);
      
      if (solicitudes.length > 0) {
        console.log('🔍 DEBUG SOLICITUDES - Primera solicitud:', JSON.stringify(solicitudes[0], null, 2));
        console.log('🔍 DEBUG SOLICITUDES - Campos de primera solicitud:', Object.keys(solicitudes[0]));
      }
      
      // Verificar si los datos ya vienen transformados (tienen campo 'id' como string y 'expediente')
      const yaTransformadas = solicitudes.length > 0 && 
        typeof solicitudes[0].id === 'string' && 
        typeof solicitudes[0].expediente === 'string';
      
      let datosProcesados: Solicitud[];
      
      if (yaTransformadas) {
        // Los datos ya vienen transformados, solo necesitamos validar y normalizar
        console.log('🔍 DEBUG SOLICITUDES - Datos ya transformados, normalizando...');
        datosProcesados = solicitudes
          .filter((s: any) => {
            // Validar que tenga los campos mínimos
            return !!(s.id && s.expediente && s.titular);
          })
          .map((s: any): Solicitud => ({
            id: String(s.id || ''),
            id_orden_servicio: s.id_orden_servicio || parseInt(s.id) || 0,
            expediente: s.expediente || `EXP-${s.id}`,
            titular: s.titular || s.nombreCompleto || 'Sin titular',
            marca: s.marca || s.nombreMarca || 'Sin marca',
            tipoSolicitud: s.tipoSolicitud || 'Sin servicio',
            encargado: s.encargado || 'Sin asignar',
            estado: s.estado || 'Sin estado',
            email: s.email || '',
            telefono: s.telefono,
            fechaCreacion: s.fechaCreacion || '',
            fechaSolicitud: s.fechaSolicitud || s.fechaFin || '',
            id_cliente: s.id_cliente || 0,
            id_empleado_asignado: s.id_empleado_asignado,
            clienteCompleto: s.clienteCompleto,
            empleadoCompleto: s.empleadoCompleto,
            servicioCompleto: s.servicioCompleto,
          }));
      } else {
        // Los datos vienen en formato API, necesitan transformación
        console.log('🔍 DEBUG SOLICITUDES - Datos en formato API, transformando...');
        datosProcesados = solicitudes
          .map(transformarRespuestaDelAPI)
          .filter((s): s is Solicitud => s !== null);
      }
      
      // Filtrar solo solicitudes en proceso (excluir estados terminales)
      const enProceso = datosProcesados.filter((s) => {
        const estado = s.estado || '';
        return !ESTADOS_TERMINALES.includes(estado as any);
      });
      
      console.log('🔍 DEBUG SOLICITUDES - Solicitudes en proceso:', enProceso.length);
      
      return enProceso;
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener detalle de solicitud
  async getSolicitudById(id: number): Promise<SolicitudDetalle> {
    try {
      const response = await apiClient.get<SolicitudDetalle>(`/gestion-solicitudes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Crear solicitud
  async crearSolicitud(servicioId: number, datos: CrearSolicitudPayload): Promise<CrearSolicitudResponse> {
    try {
      const response = await apiClient.post<CrearSolicitudResponse>(
        `/gestion-solicitudes/crear/${servicioId}`,
        datos
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Editar solicitud
  async editarSolicitud(id: number, datos: EditarSolicitudPayload): Promise<CrearSolicitudResponse> {
    try {
      const response = await apiClient.put<CrearSolicitudResponse>(
        `/gestion-solicitudes/editar/${id}`,
        datos
      );
      return response.data;
    } catch (error) {
      console.error('Error al editar solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Anular solicitud
  async anularSolicitud(id: number, motivo: string): Promise<CrearSolicitudResponse> {
    try {
      const payload: AnularSolicitudPayload = { motivo: motivo.trim() };
      const response = await apiClient.put<CrearSolicitudResponse>(
        `/gestion-solicitudes/anular/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error al anular solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Asignar empleado
  async asignarEmpleado(id: number, idEmpleado: number): Promise<CrearSolicitudResponse> {
    try {
      const payload: AsignarEmpleadoPayload = { id_empleado: idEmpleado };
      const response = await apiClient.put<CrearSolicitudResponse>(
        `/gestion-solicitudes/asignar-empleado/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error al asignar empleado:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener empleado asignado
  async getEmpleadoAsignado(id: number): Promise<EmpleadoAsignadoResponse> {
    try {
      const response = await apiClient.get<EmpleadoAsignadoResponse>(
        `/gestion-solicitudes/${id}/empleado-asignado`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleado asignado:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener estados disponibles
  async getEstadosDisponibles(id: number): Promise<EstadosDisponiblesResponse> {
    try {
      const response = await apiClient.get<EstadosDisponiblesResponse>(
        `/gestion-solicitudes/${id}/estados-disponibles`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados disponibles:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Descargar archivos ZIP
  async descargarArchivos(id: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/gestion-solicitudes/${id}/descargar-archivos`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar archivos:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await apiClient.get<Cliente[]>('/gestion-clientes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener empleados
  async getEmpleados(): Promise<Empleado[]> {
    try {
      const response = await apiClient.get<{ success?: boolean; data?: Empleado[] }>('/gestion-empleados');
      const empleados = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      
      // Filtrar solo empleados activos
      return empleados.filter((e) => e.estado_empleado === true || e.estado_empleado === 1);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener servicios
  async getServicios(): Promise<Servicio[]> {
    try {
      const response = await apiClient.get<Servicio[] | { data?: Servicio[] }>('/servicios');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Crear seguimiento
  async crearSeguimiento(datos: CrearSeguimientoPayload): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await apiClient.post('/seguimiento/crear', datos);
      return response.data;
    } catch (error) {
      console.error('Error al crear seguimiento:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener historial de seguimiento
  async getHistorialSeguimiento(idOrdenServicio: number): Promise<Seguimiento[]> {
    try {
      const response = await apiClient.get<Seguimiento[]>(`/seguimiento/historial/${idOrdenServicio}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener historial de seguimiento:', error);
      throw manejarErrorAPI(error);
    }
  },
};


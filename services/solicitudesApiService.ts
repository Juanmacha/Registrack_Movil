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
  // Función auxiliar para procesar solicitudes
  procesarSolicitudes(solicitudes: any[]): Solicitud[] {
    if (solicitudes.length === 0) return [];
    
    // Verificar si los datos ya vienen transformados
    const yaTransformadas = typeof solicitudes[0].id === 'string' && 
      typeof solicitudes[0].expediente === 'string';
    
    let datosProcesados: Solicitud[];
    
    if (yaTransformadas) {
      datosProcesados = solicitudes
        .filter((s: any) => !!(s.id && s.expediente && s.titular))
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
      datosProcesados = solicitudes
        .map(transformarRespuestaDelAPI)
        .filter((s): s is Solicitud => s !== null);
    }
    
    return datosProcesados;
  },

  // Obtener todas las solicitudes (solo en proceso)
  async getAllSolicitudes(): Promise<Solicitud[]> {
    try {
      const response = await apiClient.get<any[]>('/gestion-solicitudes');
      const solicitudes = Array.isArray(response.data) ? response.data : [];
      const datosProcesados = this.procesarSolicitudes(solicitudes);
      
      // Filtrar solo solicitudes en proceso (excluir estados terminales)
      const enProceso = datosProcesados.filter((s) => {
        const estado = s.estado || '';
        return !ESTADOS_TERMINALES.includes(estado as any);
      });
      
      return enProceso;
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener mis solicitudes (cliente) - devuelve todas sin filtrar
  async getMisSolicitudes(): Promise<Solicitud[]> {
    try {
      const response = await apiClient.get<any[]>('/gestion-solicitudes/mias');
      // La respuesta es un array directo según la documentación
      const solicitudes = Array.isArray(response.data) ? response.data : [];
      const datosProcesados = this.procesarSolicitudes(solicitudes);
      return datosProcesados;
    } catch (error) {
      console.error('Error al obtener mis solicitudes:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener solicitudes finalizadas/anuladas
  async getSolicitudesFinalizadas(): Promise<Solicitud[]> {
    try {
      const response = await apiClient.get<any[]>('/gestion-solicitudes');
      const solicitudes = Array.isArray(response.data) ? response.data : [];
      const datosProcesados = this.procesarSolicitudes(solicitudes);
      
      // Filtrar solo solicitudes finalizadas/anuladas (estados terminales)
      const finalizadas = datosProcesados.filter((s) => {
        const estado = s.estado || '';
        return ESTADOS_TERMINALES.includes(estado as any);
      });
      
      return finalizadas;
    } catch (error) {
      console.error('Error al obtener solicitudes finalizadas:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener detalle de solicitud (para administradores/empleados)
  async getSolicitudById(id: number): Promise<SolicitudDetalle> {
    try {
      const response = await apiClient.get<SolicitudDetalle>(`/gestion-solicitudes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener detalle de solicitud como cliente (usa endpoint /mias y filtra por ID)
  // Según DOCUMENTACION_MIS_PROCESOS_MOVIL.md, el endpoint /mias devuelve un array directo
  // con toda la información necesaria para el detalle
  async getSolicitudByIdCliente(id: number): Promise<SolicitudDetalle> {
    try {
      // Obtener todas las solicitudes del cliente (activas e historial)
      // Según la documentación, este endpoint devuelve todas las solicitudes sin filtrar
      const response = await apiClient.get<any[]>('/gestion-solicitudes/mias');
      
      // La respuesta es un array directo según la documentación
      let solicitudes = Array.isArray(response.data) ? response.data : [];
      
      // Si la respuesta está envuelta en un objeto, extraer el array
      if (!Array.isArray(solicitudes) && response.data?.data && Array.isArray(response.data.data)) {
        solicitudes = response.data.data;
      }
      
      console.log('🔍 Buscando solicitud con ID:', id);
      console.log('📋 Total de solicitudes recibidas:', solicitudes.length);
      console.log('📋 Primeras 3 solicitudes (muestra):', solicitudes.slice(0, 3).map(s => ({
        id: s.id,
        id_orden_servicio: s.id_orden_servicio,
        expediente: s.expediente,
        estado: s.estado
      })));
      
      // Normalizar el ID a número para comparación
      const idBuscado = Number(id);
      
      // Buscar la solicitud específica por id_orden_servicio o id
      // Según la documentación, el campo principal es id_orden_servicio
      const solicitudEncontrada = solicitudes.find((s) => {
        // Intentar múltiples formas de comparación
        const idOrdenServicio = s.id_orden_servicio !== undefined ? Number(s.id_orden_servicio) : null;
        const idSolicitud = s.id !== undefined ? Number(s.id) : null;
        
        // Comparar con el ID buscado
        if (idOrdenServicio !== null && idOrdenServicio === idBuscado) {
          return true;
        }
        if (idSolicitud !== null && idSolicitud === idBuscado) {
          return true;
        }
        
        // Comparación como string (por si acaso)
        if (String(idOrdenServicio) === String(idBuscado)) {
          return true;
        }
        if (String(idSolicitud) === String(idBuscado)) {
          return true;
        }
        
        return false;
      });
      
      if (!solicitudEncontrada) {
        console.error('❌ Solicitud no encontrada. ID buscado:', idBuscado);
        console.error('📋 IDs disponibles en el array:', solicitudes.map(s => ({
          id: s.id,
          id_orden_servicio: s.id_orden_servicio,
          expediente: s.expediente || s.expediente_numero,
          estado: s.estado
        })));
        throw new Error(`Solicitud con ID ${idBuscado} no encontrada en tus solicitudes. Verifica que la solicitud pertenezca a tu cuenta.`);
      }
      
      console.log('✅ Solicitud encontrada:', {
        id: solicitudEncontrada.id,
        id_orden_servicio: solicitudEncontrada.id_orden_servicio,
        expediente: solicitudEncontrada.expediente,
        estado: solicitudEncontrada.estado
      });
      
      // La respuesta de /mias ya tiene toda la información necesaria según la documentación
      // Incluye: id, id_orden_servicio, estado, expediente, marca_a_buscar, servicio, 
      // empleado_asignado, cliente, fecha_solicitud, updatedAt, motivo_anulacion, etc.
      return solicitudEncontrada as SolicitudDetalle;
    } catch (error: any) {
      console.error('Error al obtener detalle de solicitud como cliente:', error);
      
      // Si el error ya tiene un mensaje personalizado, lanzarlo tal cual
      if (error.message && error.message.includes('no encontrada')) {
        throw error;
      }
      
      // Si es un error de red o API, usar el manejador de errores
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

  // Procesar pago (mock para demo)
  // El monto es opcional - se toma automáticamente del total_estimado de la orden
  async procesarPago(idOrdenServicio: number, metodoPago: string = 'Tarjeta', monto?: number, datosTarjeta?: any): Promise<any> {
    try {
      const payload: any = {
        id_orden_servicio: idOrdenServicio,
        metodo_pago: metodoPago,
      };
      
      // Solo incluir monto si se proporciona (opcional)
      if (monto !== undefined && monto !== null) {
        payload.monto = monto;
      }
      
      if (datosTarjeta) {
        payload.datos_tarjeta = datosTarjeta;
      }
      
      const response = await apiClient.post<any>(
        `/gestion-pagos/process-mock`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error al procesar pago:', error);
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
      const response = await apiClient.get<any>('/gestion-clientes');
      
      // La API puede devolver los clientes en diferentes estructuras:
      // 1. Array directo: response.data = [...]
      // 2. Objeto con data.clientes: response.data = { data: { clientes: [...] } }
      // 3. Objeto con clientes: response.data = { clientes: [...] }
      
      let clientes: any[] = [];
      
      if (Array.isArray(response.data)) {
        // Caso 1: Array directo
        clientes = response.data;
      } else if (response.data?.data?.clientes && Array.isArray(response.data.data.clientes)) {
        // Caso 2: Estructura anidada con data.clientes
        clientes = response.data.data.clientes;
      } else if (response.data?.clientes && Array.isArray(response.data.clientes)) {
        // Caso 3: Estructura con clientes directo
        clientes = response.data.clientes;
      }
      
      // Transformar los clientes al formato esperado
      return clientes.map((cliente: any) => {
        // Si el cliente tiene un objeto usuario anidado, extraer sus datos
        if (cliente.usuario) {
          return {
            id_cliente: cliente.id_cliente,
            id_usuario: cliente.id_usuario || cliente.usuario.id_usuario,
            nombre: cliente.usuario.nombre || cliente.nombre || '',
            apellido: cliente.usuario.apellido || cliente.apellido || '',
            correo: cliente.usuario.correo || cliente.correo || '',
            telefono: cliente.usuario.telefono || cliente.telefono || '',
            tipo_documento: cliente.usuario.tipo_documento || cliente.tipo_documento || 'CC',
            documento: cliente.usuario.documento || cliente.documento || '',
            direccion: cliente.usuario.direccion || cliente.direccion || '',
            ciudad: cliente.usuario.ciudad || cliente.ciudad || '',
            tipo_persona: cliente.tipo_persona || 'Natural',
            marca: cliente.marca || '',
            estado: cliente.estado !== undefined ? cliente.estado : true,
          };
        }
        
        // Si no tiene usuario anidado, devolver tal cual
        return {
          id_cliente: cliente.id_cliente,
          id_usuario: cliente.id_usuario,
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          correo: cliente.correo || '',
          telefono: cliente.telefono || '',
          tipo_documento: cliente.tipo_documento || 'CC',
          documento: cliente.documento || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || '',
          tipo_persona: cliente.tipo_persona || 'Natural',
          marca: cliente.marca || '',
          estado: cliente.estado !== undefined ? cliente.estado : true,
        };
      });
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
  // Obtener historial de seguimiento (para administradores/empleados)
  async getHistorialSeguimiento(idOrdenServicio: number): Promise<Seguimiento[]> {
    try {
      const response = await apiClient.get<Seguimiento[]>(`/seguimiento/historial/${idOrdenServicio}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener historial de seguimiento:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Obtener historial de seguimiento como cliente (usa endpoint /cliente/:idOrdenServicio)
  async getHistorialSeguimientoCliente(idOrdenServicio: number): Promise<Seguimiento[]> {
    try {
      const response = await apiClient.get<any>(`/seguimiento/cliente/${idOrdenServicio}`);
      
      // La respuesta puede venir como array directo o envuelto en data
      let seguimientos: Seguimiento[] = [];
      
      if (Array.isArray(response.data)) {
        seguimientos = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        seguimientos = response.data.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        seguimientos = response.data.data;
      }
      
      // Ordenar por fecha (más reciente primero)
      seguimientos.sort((a, b) => {
        const fechaA = new Date(a.fecha_registro || a.fecha_creacion || a.fecha || 0);
        const fechaB = new Date(b.fecha_registro || b.fecha_creacion || b.fecha || 0);
        return fechaB.getTime() - fechaA.getTime();
      });
      
      return seguimientos;
    } catch (error) {
      console.error('Error al obtener historial de seguimiento como cliente:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Descargar archivos de seguimiento
  async descargarArchivosSeguimiento(idSeguimiento: number): Promise<Blob> {
    try {
      const authHeader = apiClient.defaults.headers.common['Authorization'];
      const token = typeof authHeader === 'string' ? authHeader : '';
      const baseURL = apiClient.defaults.baseURL || API_CONFIG.baseURL;
      const url = `${baseURL}/seguimiento/${idSeguimiento}/descargar-archivos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { mensaje: errorText || `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.mensaje || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error al descargar archivos de seguimiento:', error);
      throw manejarErrorAPI(error);
    }
  },

  // Descargar archivos ZIP de la solicitud
  async descargarArchivosSolicitudZip(idOrdenServicio: number): Promise<{ blob: Blob; filename: string }> {
    try {
      const authHeader = apiClient.defaults.headers.common['Authorization'];
      const token = typeof authHeader === 'string' ? authHeader : '';
      const baseURL = apiClient.defaults.baseURL || API_CONFIG.baseURL;
      const url = `${baseURL}/gestion-solicitudes/${idOrdenServicio}/descargar-archivos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { mensaje: errorText || `Error ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.mensaje || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Archivos_Solicitud_${idOrdenServicio}.zip`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
          filename = decodeURIComponent(filename);
        }
      }

      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error('Error al descargar archivos ZIP de la solicitud:', error);
      throw manejarErrorAPI(error);
    }
  },
};


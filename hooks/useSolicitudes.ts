import { useContext, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  solicitudesApiService,
  setSolicitudesAuthToken,
} from '@/services/solicitudesApiService';
import {
  Solicitud,
  Cliente,
  Empleado,
  Servicio,
  SolicitudDetalle,
  EstadosDisponiblesResponse,
  Seguimiento,
  CrearSolicitudPayload,
  EditarSolicitudPayload,
  CrearSeguimientoPayload,
} from '@/types/solicitudes';
import { ApiClientError, obtenerMensajeErrorUsuario } from '@/utils/apiError';

interface UseSolicitudesHook {
  solicitudes: Solicitud[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSolicitudes = (autoFetch = true): UseSolicitudesHook => {
  const { token } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getAllSolicitudes();
      setSolicitudes(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [autoFetch]);

  return { solicitudes, loading, error, refetch: fetchData };
};

interface UseSolicitudDetalleHook {
  solicitud: SolicitudDetalle | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSolicitudDetalle = (id: number | null, autoFetch = true): UseSolicitudDetalleHook => {
  const { token } = useAuth();
  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [loading, setLoading] = useState(autoFetch && id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getSolicitudById(id);
      setSolicitud(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && id) {
      void fetchData();
    }
  }, [id, autoFetch]);

  return { solicitud, loading, error, refetch: fetchData };
};

interface UseClientesHook {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useClientes = (autoFetch = false): UseClientesHook => {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getClientes();
      setClientes(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [autoFetch]);

  return { clientes, loading, error, refetch: fetchData };
};

interface UseEmpleadosHook {
  empleados: Empleado[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEmpleados = (autoFetch = false): UseEmpleadosHook => {
  const { token } = useAuth();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getEmpleados();
      setEmpleados(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [autoFetch]);

  return { empleados, loading, error, refetch: fetchData };
};

interface UseServiciosHook {
  servicios: Servicio[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useServicios = (autoFetch = false): UseServiciosHook => {
  const { token } = useAuth();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getServicios();
      setServicios(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [autoFetch]);

  return { servicios, loading, error, refetch: fetchData };
};

interface UseEstadosDisponiblesHook {
  estados: EstadosDisponiblesResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEstadosDisponibles = (
  id: number | null,
  autoFetch = false,
): UseEstadosDisponiblesHook => {
  const { token } = useAuth();
  const [estados, setEstados] = useState<EstadosDisponiblesResponse | null>(null);
  const [loading, setLoading] = useState(autoFetch && id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getEstadosDisponibles(id);
      setEstados(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && id) {
      void fetchData();
    }
  }, [id, autoFetch]);

  return { estados, loading, error, refetch: fetchData };
};

interface UseHistorialSeguimientoHook {
  historial: Seguimiento[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHistorialSeguimiento = (
  idOrdenServicio: number | null,
  autoFetch = false,
): UseHistorialSeguimientoHook => {
  const { token } = useAuth();
  const [historial, setHistorial] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(autoFetch && idOrdenServicio !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!idOrdenServicio) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setSolicitudesAuthToken(token);
      }
      const data = await solicitudesApiService.getHistorialSeguimiento(idOrdenServicio);
      setHistorial(data);
    } catch (err) {
      const message = obtenerMensajeErrorUsuario(err as ApiClientError);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && idOrdenServicio) {
      void fetchData();
    }
  }, [idOrdenServicio, autoFetch]);

  return { historial, loading, error, refetch: fetchData };
};


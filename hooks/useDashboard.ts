import { useContext, useEffect, useState } from 'react';

import { PERIODO_DEFAULT } from '@/constants/periodos';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApiService, setDashboardAuthToken } from '@/services/dashboardApiService';
import {
  DashboardIngresosResponse,
  DashboardServiciosResponse,
  DashboardRenovacionesResponse,
  DashboardInactivasResponse,
  PeriodoValue,
} from '@/types/dashboard';
import { ApiClientError, obtenerMensajeErrorUsuario } from '@/utils/apiError';

interface UseDashboardHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardIngresos = (
  periodo: PeriodoValue = PERIODO_DEFAULT,
  autoFetch = true,
): UseDashboardHook<DashboardIngresosResponse['data']> => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardIngresosResponse['data'] | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setDashboardAuthToken(token);
      }
      const response = await dashboardApiService.getIngresos(periodo);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('No se pudieron cargar los datos de ingresos.');
      }
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
  }, [periodo, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardServicios = (
  periodo: PeriodoValue = PERIODO_DEFAULT,
  autoFetch = true,
): UseDashboardHook<DashboardServiciosResponse['data']> => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardServiciosResponse['data'] | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setDashboardAuthToken(token);
      }
      const response = await dashboardApiService.getServicios(periodo);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('No se pudieron cargar los datos de servicios.');
      }
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
  }, [periodo, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardRenovaciones = (autoFetch = true): UseDashboardHook<MarcaCertificada[]> => {
  const { token } = useAuth();
  const [data, setData] = useState<MarcaCertificada[] | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setDashboardAuthToken(token);
      }
      const response = await dashboardApiService.getRenovaciones('json');
      console.log('🔍 DEBUG RENOVACIONES - Respuesta completa:', JSON.stringify(response, null, 2));
      
      // Manejar diferentes formatos de respuesta
      if (typeof response === 'string' || response instanceof Blob) {
        setError('Formato de respuesta no válido.');
        return;
      }
      
      if ('success' in response && response.success) {
        // La API devuelve renovaciones en response.renovaciones
        if ('renovaciones' in response && Array.isArray(response.renovaciones)) {
          setData(response.renovaciones);
        } else if ('data' in response && Array.isArray(response.data)) {
          // Compatibilidad con formato anterior
          setData(response.data);
        } else if (Array.isArray(response)) {
          // Si la respuesta es directamente un array
          setData(response);
        } else {
          // Si no hay renovaciones, establecer array vacío (no es un error)
          setData([]);
        }
      } else if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        setData(response);
      } else {
        console.log('🔍 DEBUG RENOVACIONES - Formato no reconocido:', typeof response);
        // En lugar de error, establecer array vacío
        setData([]);
      }
    } catch (err) {
      console.error('🔍 DEBUG RENOVACIONES - Error:', err);
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

  return { data, loading, error, refetch: fetchData };
};

export const useDashboardInactivas = (autoFetch = true): UseDashboardHook<DashboardInactivasResponse['data']> => {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardInactivasResponse['data'] | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (token) {
        setDashboardAuthToken(token);
      }
      const response = await dashboardApiService.getInactivas('json');
      if (typeof response !== 'string' && 'success' in response && response.success && response.data) {
        setData(response.data);
      } else {
        setError('No se pudieron cargar los servicios inactivos.');
      }
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

  return { data, loading, error, refetch: fetchData };
};


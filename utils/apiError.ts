import axios, { AxiosError } from 'axios';

export interface ApiErrorPayload {
  mensaje?: string;
  error?: string;
  detalles?: string | string[];
  codigo?: string;
  retryAfterMinutes?: number;
}

export interface ApiClientError extends Error {
  status?: number;
  payload?: ApiErrorPayload;
  retryAfterMinutes?: number;
  isNetworkError?: boolean;
  isSessionExpired?: boolean;
}

export const manejarErrorAPI = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const payload = axiosError.response?.data;
    const status = axiosError.response?.status;
    const headers = axiosError.response?.headers || {};
    const mensaje = payload?.mensaje ?? payload?.error ?? axiosError.message;
    
    // Intentar obtener retry-after de diferentes lugares
    let retryAfterMinutes: number | undefined;
    if (payload?.retryAfterMinutes) {
      retryAfterMinutes = Number(payload.retryAfterMinutes);
    } else if (headers['retry-after']) {
      retryAfterMinutes = Number(headers['retry-after']) / 60;
    } else if (headers['Retry-After']) {
      retryAfterMinutes = Number(headers['Retry-After']) / 60;
    }

    const apiError: ApiClientError = new Error(mensaje);
    apiError.status = status;
    apiError.payload = payload;
    apiError.retryAfterMinutes = Number.isFinite(retryAfterMinutes) && retryAfterMinutes > 0 ? retryAfterMinutes : undefined;
    apiError.isNetworkError = axiosError.code === 'ERR_NETWORK';
    apiError.isSessionExpired = status === 401 || payload?.codigo === 'SESION_EXPIRADA';

    throw apiError;
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Error desconocido al comunicarse con el servidor.');
};

export const obtenerMensajeErrorUsuario = (error: ApiClientError | Error) => {
  if ('status' in error && error.status === 429) {
    const apiError = error as ApiClientError;
    if (apiError.retryAfterMinutes) {
      const minutos = Math.ceil(apiError.retryAfterMinutes);
      return `Demasiados intentos. Intenta nuevamente en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}.`;
    }
    return 'Demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.';
  }

  if ('payload' in error && error.payload) {
    const { payload, status } = error as ApiClientError;

    if (payload.codigo === 'SESION_EXPIRADA') {
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    }

    if (payload.detalles) {
      if (Array.isArray(payload.detalles)) {
        return payload.detalles.join('\n');
      }
      return payload.detalles;
    }

    return payload.mensaje ?? payload.error ?? 'Ocurrió un error inesperado.';
  }

  if ('isNetworkError' in error && error.isNetworkError) {
    return 'No pudimos conectarnos con el servidor. Revisa tu conexión.';
  }

  return error.message ?? 'Ocurrió un error inesperado.';
};


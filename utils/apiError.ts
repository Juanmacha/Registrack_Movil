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

export const obtenerMensajeErrorUsuario = (error: ApiClientError | Error | unknown): string => {
  // Si es un string, devolverlo directamente
  if (typeof error === 'string') {
    return error;
  }

  // Si no es un objeto, convertir a string
  if (!error || typeof error !== 'object') {
    return 'Ocurrió un error inesperado.';
  }

  // Manejar errores con estructura {message, code, details, timestamp}
  if ('message' in error && typeof (error as any).message === 'string') {
    const errorObj = error as { message: string; code?: string; details?: string | string[]; timestamp?: string };
    if (errorObj.details) {
      if (Array.isArray(errorObj.details)) {
        return errorObj.details.join('\n');
      }
      return errorObj.details;
    }
    return errorObj.message;
  }

  // Manejar ApiClientError con status code
  if ('status' in error) {
    const apiError = error as ApiClientError;
    const status = apiError.status;
    const payload = apiError.payload;

    // Errores de autenticación y autorización
    if (status === 401) {
      // Credenciales incorrectas o token inválido
      if (payload?.codigo === 'SESION_EXPIRADA' || payload?.codigo === 'TOKEN_EXPIRADO') {
        return 'Tu sesión expiró. Inicia sesión nuevamente.';
      }
      if (payload?.codigo === 'CREDENCIALES_INVALIDAS' || payload?.codigo === 'INVALID_CREDENTIALS') {
        return 'Correo o contraseña incorrectos. Verifica tus credenciales e intenta de nuevo.';
      }
      // Mensaje del servidor o mensaje genérico
      return payload?.mensaje ?? payload?.error ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }

    if (status === 403) {
      return payload?.mensaje ?? payload?.error ?? 'No tienes permisos para realizar esta acción.';
    }

    if (status === 404) {
      // Usuario no encontrado
      if (payload?.codigo === 'USUARIO_NO_ENCONTRADO' || payload?.codigo === 'USER_NOT_FOUND') {
        return 'El correo electrónico no está registrado en el sistema.';
      }
      // Email no encontrado en recuperación de contraseña
      if (payload?.mensaje?.toLowerCase().includes('email') || payload?.mensaje?.toLowerCase().includes('correo')) {
        return payload.mensaje;
      }
      return payload?.mensaje ?? payload?.error ?? 'Recurso no encontrado.';
    }

    if (status === 400) {
      // Validación de datos
      if (payload?.detalles) {
        if (Array.isArray(payload.detalles)) {
          return payload.detalles.join('\n');
        }
        return payload.detalles;
      }
      // Token inválido o expirado en reset password
      if (payload?.codigo === 'TOKEN_INVALIDO' || payload?.codigo === 'INVALID_TOKEN' || 
          payload?.mensaje?.toLowerCase().includes('token') || 
          payload?.mensaje?.toLowerCase().includes('código')) {
        return payload?.mensaje ?? 'El código de recuperación es inválido o ha expirado. Solicita uno nuevo.';
      }
      // Contraseña débil
      if (payload?.mensaje?.toLowerCase().includes('contraseña') || 
          payload?.mensaje?.toLowerCase().includes('password') ||
          payload?.codigo === 'PASSWORD_WEAK') {
        return payload?.mensaje ?? 'La contraseña no cumple con los requisitos de seguridad.';
      }
      return payload?.mensaje ?? payload?.error ?? 'Datos inválidos. Verifica la información ingresada.';
    }

    if (status === 422) {
      // Datos no procesables
      if (payload?.detalles) {
        if (Array.isArray(payload.detalles)) {
          return payload.detalles.join('\n');
        }
        return payload.detalles;
      }
      return payload?.mensaje ?? payload?.error ?? 'Los datos proporcionados no son válidos.';
    }

    if (status === 429) {
      // Rate limiting
      if (apiError.retryAfterMinutes) {
        const minutos = Math.ceil(apiError.retryAfterMinutes);
        return `Demasiados intentos. Intenta nuevamente en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}.`;
      }
      return payload?.mensaje ?? 'Demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.';
    }

    if (status === 500 || status === 502 || status === 503 || status === 504) {
      return 'Error del servidor. Por favor intenta más tarde.';
    }

    // Si hay payload, intentar usar su mensaje
    if (payload) {
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
  }

  // Errores de red
  if ('isNetworkError' in error && (error as ApiClientError).isNetworkError) {
    return 'No pudimos conectarnos con el servidor. Revisa tu conexión a internet.';
  }

  // Si es un Error estándar, devolver su mensaje
  if (error instanceof Error) {
    // Mensajes comunes de autenticación
    const message = error.message.toLowerCase();
    if (message.includes('credential') || message.includes('credencial')) {
      return 'Correo o contraseña incorrectos. Verifica tus credenciales.';
    }
    if (message.includes('network') || message.includes('conexión') || message.includes('connection')) {
      return 'No pudimos conectarnos con el servidor. Revisa tu conexión.';
    }
    if (message.includes('timeout')) {
      return 'La solicitud tardó demasiado. Intenta nuevamente.';
    }
    return error.message ?? 'Ocurrió un error inesperado.';
  }

  // Fallback: intentar obtener cualquier propiedad que parezca un mensaje
  if ('mensaje' in error && typeof (error as any).mensaje === 'string') {
    return (error as any).mensaje;
  }

  return 'Ocurrió un error inesperado.';
};


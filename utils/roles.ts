import { Usuario } from '@/types/auth';

/**
 * Verifica si un rol tiene permisos administrativos basándose en sus permisos
 */
const esRolAdministrativo = (rol: Usuario['rol']): boolean => {
  if (!rol || typeof rol !== 'object' || !rol.permisos) {
    return false;
  }

  const permisos = rol.permisos;

  // Si tiene permiso de dashboard, es administrativo
  if (permisos.dashboard?.leer === true) {
    console.log('✅ Rol administrativo detectado por permiso dashboard');
    return true;
  }

  // Si tiene permiso de gestion_dashboard, es administrativo
  if (permisos.gestion_dashboard?.leer === true) {
    console.log('✅ Rol administrativo detectado por permiso gestion_dashboard');
    return true;
  }

  // Verificar módulos administrativos
  const modulosAdministrativos = [
    'usuarios',
    'empleados',
    'roles',
    'permisos',
    'privilegios',
    'solicitudes',
    'citas',
    'seguimiento',
    'clientes',
    'pagos',
    'servicios',
    'empresas',
    'archivos',
    'tipo_archivos',
    'solicitud_cita',
    'detalles_orden',
    'detalles_procesos',
    'servicios_procesos',
  ];

  // Verificar si tiene al menos un permiso activo en algún módulo administrativo
  for (const modulo of modulosAdministrativos) {
    const moduloPermisos = permisos[modulo];
    if (
      moduloPermisos &&
      (moduloPermisos.crear === true ||
        moduloPermisos.leer === true ||
        moduloPermisos.actualizar === true ||
        moduloPermisos.eliminar === true)
    ) {
      console.log('✅ Rol administrativo detectado por permiso:', modulo);
      return true;
    }
  }

  return false;
};

/**
 * Verifica si un usuario tiene un rol administrativo
 * Basado en la lógica del frontend web
 */
export const tieneRolAdministrativo = (usuario?: Usuario | null): boolean => {
  // DEBUG: Log para ver qué se está evaluando
  console.log('🔍 DEBUG ROLES - Usuario:', usuario);
  console.log('🔍 DEBUG ROLES - Rol del usuario:', usuario?.rol);
  console.log('🔍 DEBUG ROLES - Tipo de rol:', typeof usuario?.rol);

  if (!usuario) {
    console.log('⚠️ Usuario no proporcionado');
    return false;
  }

  // 1. Verificar por ID de rol primero (más confiable)
  const roleId = usuario.rol?.id ?? usuario.id_rol ?? usuario.idRol ?? (usuario.rol as { id?: number })?.id;
  console.log('🔍 DEBUG ROLES - RoleId:', roleId);

  if (roleId !== undefined && roleId !== null) {
    const idNum = Number(roleId);
    // Según el backend: 1=Cliente, 2=Administrador, 3=Empleado
    // Solo IDs 2 y 3 son administrativos
    if (idNum === 2 || idNum === 3) {
      console.log('✅ Rol administrativo detectado por ID:', idNum);
      return true;
    }
    // ID 1 es cliente, no administrativo
    if (idNum === 1) {
      console.log('❌ ID 1 = Cliente (no administrativo)');
      return false;
    }
  }

  // 2. Si el rol es un objeto con permisos, verificar
  if (typeof usuario.rol === 'object' && usuario.rol !== null && usuario.rol.permisos) {
    const esAdmin = esRolAdministrativo(usuario.rol);
    if (esAdmin) {
      return true;
    }
  }

  // 3. Verificar por nombre del rol
  const roleName =
    typeof usuario.rol === 'string'
      ? usuario.rol
      : usuario.rol?.nombre ?? usuario.rol?.name ?? (usuario as { role?: string }).role ?? '';

  const roleNameLower = roleName.toLowerCase().trim();
  console.log('🔍 DEBUG ROLES - Nombre del rol normalizado:', roleNameLower);

  // Roles administrativos conocidos (case-insensitive)
  const esAdminPorNombre =
    roleNameLower === 'administrador' ||
    roleNameLower === 'admin' ||
    roleNameLower === 'empleado' ||
    roleNameLower === 'employee' ||
    roleNameLower === 'supervisor' ||
    roleNameLower === 'gerente' ||
    roleNameLower === 'manager';

  if (esAdminPorNombre) {
    console.log('✅ Rol administrativo detectado por nombre:', roleNameLower);
    return true;
  }

  console.log('❌ No es un rol administrativo');
  return false;
};


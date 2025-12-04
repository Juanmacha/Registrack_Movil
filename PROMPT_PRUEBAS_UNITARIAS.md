# 🧪 PROMPT PARA PRUEBAS UNITARIAS - Registro de Usuario y Pago

## 📋 CONTEXTO DEL PROYECTO

Necesito crear pruebas unitarias para un sistema de gestión que maneja dos tipos principales de registros:

1. **Registro de Usuario**
2. **Registro de Pago**

Debes seguir la metodología de pruebas unitarias con JTest (Jest) siguiendo los pasos estándar de configuración, preparación, ejecución, verificación y limpieza.

---

## 🎯 OBJETIVO

Crear un conjunto completo de pruebas unitarias que validen:
- ✅ Creación de registros de usuario
- ✅ Creación de registros de pago
- ✅ Validaciones de campos requeridos
- ✅ Validaciones de formato de datos
- ✅ Manejo de errores
- ✅ Casos límite y edge cases

---

## 📊 ESTRUCTURA DE DATOS

### 1. REGISTRO DE USUARIO

#### Campos Requeridos:
```typescript
interface RegistroUsuario {
  tipo_documento: string;        // "CC", "CE", "NIT", "Cédula de Ciudadanía", etc.
  documento: string | number;      // Número de documento (ej: "12345678" o 12345678)
  nombre: string;                  // Nombre del usuario
  apellido: string;                // Apellido del usuario
  correo: string;                  // Email válido
  contrasena: string;              // Contraseña (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)
  id_rol: number;                 // ID del rol (1: administrador, 2: empleado, 3: cliente)
}
```

#### Campos Opcionales:
```typescript
interface RegistroUsuarioCompleto extends RegistroUsuario {
  telefono?: string;              // Número de teléfono (ej: "+57 300 123 4567")
}
```

#### Validaciones Requeridas:
- `tipo_documento`: Debe ser uno de los valores permitidos
- `documento`: No puede estar vacío, debe ser único en el sistema
- `nombre`: Mínimo 2 caracteres, máximo 50, solo letras y espacios
- `apellido`: Mínimo 2 caracteres, máximo 50, solo letras y espacios
- `correo`: Formato de email válido, debe ser único en el sistema
- `contrasena`: 
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*)
- `id_rol`: Debe ser un número válido (1, 2 o 3)
- `telefono`: Si se proporciona, debe tener formato válido

---

### 2. REGISTRO DE PAGO

#### Campos Requeridos:
```typescript
interface RegistroPago {
  id_orden_servicio: number;       // ID de la orden de servicio asociada
  monto: number;                   // Monto del pago (debe ser mayor a 0)
  metodo_pago: string;             // Método de pago (ej: "Transferencia bancaria", "Tarjeta de crédito", "Efectivo", "Cheque")
  fecha_pago: string;              // Fecha en formato ISO (YYYY-MM-DD)
  estado: string;                  // Estado del pago ("Pendiente", "Completado", "Cancelado", "Rechazado")
  referencia: string;              // Referencia de la transacción (debe ser único)
  observaciones?: string;          // Observaciones opcionales sobre el pago
}
```

#### Validaciones Requeridas:
- `id_orden_servicio`: Debe existir en el sistema, debe ser un número positivo
- `monto`: Debe ser mayor a 0, máximo 2 decimales
- `metodo_pago`: Debe ser uno de los métodos permitidos
- `fecha_pago`: Formato válido (YYYY-MM-DD), no puede ser fecha futura (opcional según reglas de negocio)
- `estado`: Debe ser uno de los estados permitidos
- `referencia`: No puede estar vacío, debe ser único en el sistema
- `observaciones`: Si se proporciona, máximo 500 caracteres

---

## 🧪 ESTRUCTURA DE PRUEBAS UNITARIAS

### PASO 1: CONFIGURACIÓN (SETUP)

```javascript
describe('Pruebas de Registro de Usuario', () => {
  // Configuración antes de todas las pruebas
  beforeAll(() => {
    // Inicializar base de datos de prueba
    // Configurar mocks
    // Establecer variables de entorno de prueba
  });

  // Configuración antes de cada prueba
  beforeEach(() => {
    // Limpiar datos de prueba anteriores
    // Resetear mocks
    // Preparar estado inicial
  });

  // Limpieza después de cada prueba
  afterEach(() => {
    // Limpiar datos creados
    // Restaurar mocks
  });

  // Limpieza después de todas las pruebas
  afterAll(() => {
    // Cerrar conexiones
    // Limpiar recursos
  });
});
```

---

### PASO 2: CASOS DE PRUEBA PARA REGISTRO DE USUARIO

#### Test 1: Crear usuario exitosamente con todos los campos requeridos
```javascript
test('debe crear un usuario exitosamente con todos los campos válidos', async () => {
  // ARRANGE (Preparar)
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan.perez@example.com",
    contrasena: "Password123!",
    id_rol: 3,
    telefono: "+57 300 123 4567"
  };

  // ACT (Ejecutar)
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT (Verificar)
  expect(resultado.success).toBe(true);
  expect(resultado.usuario).toBeDefined();
  expect(resultado.usuario.documento).toBe("12345678");
  expect(resultado.usuario.correo).toBe("juan.perez@example.com");
  expect(resultado.usuario.id_rol).toBe(3);
  expect(resultado.usuario).not.toHaveProperty('contrasena'); // La contraseña no debe retornarse
});
```

#### Test 2: Validar que no se puede crear usuario sin campos requeridos
```javascript
test('debe rechazar crear usuario sin campos requeridos', async () => {
  // ARRANGE
  const datosUsuarioIncompleto = {
    nombre: "Juan",
    apellido: "Pérez"
    // Faltan: tipo_documento, documento, correo, contrasena, id_rol
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioIncompleto);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error).toBeDefined();
  expect(resultado.error.camposFaltantes).toContain('tipo_documento');
  expect(resultado.error.camposFaltantes).toContain('documento');
  expect(resultado.error.camposFaltantes).toContain('correo');
  expect(resultado.error.camposFaltantes).toContain('contrasena');
  expect(resultado.error.camposFaltantes).toContain('id_rol');
});
```

#### Test 3: Validar formato de correo electrónico
```javascript
test('debe rechazar correo electrónico con formato inválido', async () => {
  // ARRANGE
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "correo-invalido", // Formato inválido
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('correo');
  expect(resultado.error.mensaje).toContain('formato');
});
```

#### Test 4: Validar fortaleza de contraseña
```javascript
test('debe rechazar contraseña débil', async () => {
  // ARRANGE
  const casosContrasenaDebil = [
    "1234567",           // Muy corta
    "password",         // Sin mayúsculas ni números ni especiales
    "PASSWORD",         // Sin minúsculas ni números ni especiales
    "Password",         // Sin números ni especiales
    "Password1",        // Sin caracteres especiales
    "Password!",        // Sin números
  ];

  for (const contrasena of casosContrasenaDebil) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: contrasena,
      id_rol: 3
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('contraseña');
  }
});
```

#### Test 5: Validar que el documento sea único
```javascript
test('debe rechazar usuario con documento duplicado', async () => {
  // ARRANGE
  const documento = "12345678";
  
  // Crear primer usuario
  await crearUsuario({
    tipo_documento: "CC",
    documento: documento,
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan1@example.com",
    contrasena: "Password123!",
    id_rol: 3
  });

  // Intentar crear segundo usuario con mismo documento
  const datosUsuarioDuplicado = {
    tipo_documento: "CC",
    documento: documento,
    nombre: "Pedro",
    apellido: "García",
    correo: "pedro@example.com",
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioDuplicado);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('documento');
  expect(resultado.error.mensaje).toContain('duplicado');
});
```

#### Test 6: Validar que el correo sea único
```javascript
test('debe rechazar usuario con correo duplicado', async () => {
  // ARRANGE
  const correo = "test@example.com";
  
  // Crear primer usuario
  await crearUsuario({
    tipo_documento: "CC",
    documento: "11111111",
    nombre: "Juan",
    apellido: "Pérez",
    correo: correo,
    contrasena: "Password123!",
    id_rol: 3
  });

  // Intentar crear segundo usuario con mismo correo
  const datosUsuarioDuplicado = {
    tipo_documento: "CC",
    documento: "22222222",
    nombre: "Pedro",
    apellido: "García",
    correo: correo,
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioDuplicado);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('correo');
  expect(resultado.error.mensaje).toContain('duplicado');
});
```

#### Test 7: Validar tipos de documento permitidos
```javascript
test('debe aceptar solo tipos de documento válidos', async () => {
  // ARRANGE
  const tiposValidos = ["CC", "CE", "NIT", "Cédula de Ciudadanía", "Cédula de Extranjería"];
  const tipoInvalido = "TIPO_INVALIDO";

  // Test con tipo válido
  for (const tipo of tiposValidos) {
    const datosUsuario = {
      tipo_documento: tipo,
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: 3
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(true);
  }

  // Test con tipo inválido
  const datosUsuarioInvalido = {
    tipo_documento: tipoInvalido,
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test@example.com",
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('tipo_documento');
});
```

#### Test 8: Validar roles válidos
```javascript
test('debe aceptar solo roles válidos (1, 2, 3)', async () => {
  // ARRANGE
  const rolesValidos = [1, 2, 3];
  const rolInvalido = 999;

  // Test con roles válidos
  for (const rol of rolesValidos) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: rol
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(true);
    expect(resultado.usuario.id_rol).toBe(rol);
  }

  // Test con rol inválido
  const datosUsuarioInvalido = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test@example.com",
    contrasena: "Password123!",
    id_rol: rolInvalido
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('rol');
});
```

---

### PASO 3: CASOS DE PRUEBA PARA REGISTRO DE PAGO

#### Test 1: Crear pago exitosamente con todos los campos requeridos
```javascript
test('debe crear un pago exitosamente con todos los campos válidos', async () => {
  // ARRANGE
  const datosPago = {
    id_orden_servicio: 1,
    monto: 1500000.00,
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: "TXN123456789",
    observaciones: "Pago procesado correctamente"
  };

  // ACT
  const resultado = await crearPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.pago).toBeDefined();
  expect(resultado.pago.monto).toBe(1500000.00);
  expect(resultado.pago.referencia).toBe("TXN123456789");
  expect(resultado.pago.estado).toBe("Completado");
});
```

#### Test 2: Validar que no se puede crear pago sin campos requeridos
```javascript
test('debe rechazar crear pago sin campos requeridos', async () => {
  // ARRANGE
  const datosPagoIncompleto = {
    monto: 1500000.00
    // Faltan: id_orden_servicio, metodo_pago, fecha_pago, estado, referencia
  };

  // ACT
  const resultado = await crearPago(datosPagoIncompleto);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error).toBeDefined();
  expect(resultado.error.camposFaltantes).toContain('id_orden_servicio');
  expect(resultado.error.camposFaltantes).toContain('metodo_pago');
  expect(resultado.error.camposFaltantes).toContain('fecha_pago');
  expect(resultado.error.camposFaltantes).toContain('estado');
  expect(resultado.error.camposFaltantes).toContain('referencia');
});
```

#### Test 3: Validar que el monto sea mayor a cero
```javascript
test('debe rechazar pago con monto menor o igual a cero', async () => {
  // ARRANGE
  const montosInvalidos = [0, -100, -0.01];

  for (const monto of montosInvalidos) {
    const datosPago = {
      id_orden_servicio: 1,
      monto: monto,
      metodo_pago: "Transferencia bancaria",
      fecha_pago: "2024-01-15",
      estado: "Completado",
      referencia: `TXN${Math.random().toString().slice(2, 11)}`
    };

    // ACT
    const resultado = await crearPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('monto');
  }
});
```

#### Test 4: Validar formato de monto (máximo 2 decimales)
```javascript
test('debe rechazar monto con más de 2 decimales', async () => {
  // ARRANGE
  const datosPago = {
    id_orden_servicio: 1,
    monto: 1500000.123, // Más de 2 decimales
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: "TXN123456789"
  };

  // ACT
  const resultado = await crearPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('decimales');
});
```

#### Test 5: Validar que la orden de servicio exista
```javascript
test('debe rechazar pago con orden de servicio inexistente', async () => {
  // ARRANGE
  const idOrdenInexistente = 99999;
  const datosPago = {
    id_orden_servicio: idOrdenInexistente,
    monto: 1500000.00,
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: "TXN123456789"
  };

  // ACT
  const resultado = await crearPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('orden de servicio');
  expect(resultado.error.mensaje).toContain('no encontrada');
});
```

#### Test 6: Validar métodos de pago permitidos
```javascript
test('debe aceptar solo métodos de pago válidos', async () => {
  // ARRANGE
  const metodosValidos = [
    "Transferencia bancaria",
    "Tarjeta de crédito",
    "Tarjeta de débito",
    "Efectivo",
    "Cheque"
  ];
  const metodoInvalido = "Método Inexistente";

  // Test con métodos válidos
  for (const metodo of metodosValidos) {
    const datosPago = {
      id_orden_servicio: 1,
      monto: 1500000.00,
      metodo_pago: metodo,
      fecha_pago: "2024-01-15",
      estado: "Completado",
      referencia: `TXN${Math.random().toString().slice(2, 11)}`
    };

    // ACT
    const resultado = await crearPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(true);
  }

  // Test con método inválido
  const datosPagoInvalido = {
    id_orden_servicio: 1,
    monto: 1500000.00,
    metodo_pago: metodoInvalido,
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: "TXN123456789"
  };

  // ACT
  const resultado = await crearPago(datosPagoInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('método de pago');
});
```

#### Test 7: Validar estados de pago permitidos
```javascript
test('debe aceptar solo estados de pago válidos', async () => {
  // ARRANGE
  const estadosValidos = ["Pendiente", "Completado", "Cancelado", "Rechazado"];
  const estadoInvalido = "Estado Inexistente";

  // Test con estados válidos
  for (const estado of estadosValidos) {
    const datosPago = {
      id_orden_servicio: 1,
      monto: 1500000.00,
      metodo_pago: "Transferencia bancaria",
      fecha_pago: "2024-01-15",
      estado: estado,
      referencia: `TXN${Math.random().toString().slice(2, 11)}`
    };

    // ACT
    const resultado = await crearPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(true);
  }

  // Test con estado inválido
  const datosPagoInvalido = {
    id_orden_servicio: 1,
    monto: 1500000.00,
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: estadoInvalido,
    referencia: "TXN123456789"
  };

  // ACT
  const resultado = await crearPago(datosPagoInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('estado');
});
```

#### Test 8: Validar que la referencia sea única
```javascript
test('debe rechazar pago con referencia duplicada', async () => {
  // ARRANGE
  const referencia = "TXN123456789";
  
  // Crear primer pago
  await crearPago({
    id_orden_servicio: 1,
    monto: 1500000.00,
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: referencia
  });

  // Intentar crear segundo pago con misma referencia
  const datosPagoDuplicado = {
    id_orden_servicio: 2,
    monto: 2000000.00,
    metodo_pago: "Tarjeta de crédito",
    fecha_pago: "2024-01-16",
    estado: "Completado",
    referencia: referencia
  };

  // ACT
  const resultado = await crearPago(datosPagoDuplicado);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('referencia');
  expect(resultado.error.mensaje).toContain('duplicada');
});
```

#### Test 9: Validar formato de fecha
```javascript
test('debe rechazar fecha con formato inválido', async () => {
  // ARRANGE
  const fechasInvalidas = [
    "15-01-2024",      // Formato incorrecto
    "2024/01/15",      // Separador incorrecto
    "01-15-2024",      // Formato americano
    "2024-1-15",       // Mes sin cero inicial
    "invalid-date"      // No es una fecha
  ];

  for (const fecha of fechasInvalidas) {
    const datosPago = {
      id_orden_servicio: 1,
      monto: 1500000.00,
      metodo_pago: "Transferencia bancaria",
      fecha_pago: fecha,
      estado: "Completado",
      referencia: `TXN${Math.random().toString().slice(2, 11)}`
    };

    // ACT
    const resultado = await crearPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('fecha');
  }
});
```

#### Test 10: Validar longitud de observaciones
```javascript
test('debe rechazar observaciones con más de 500 caracteres', async () => {
  // ARRANGE
  const observacionesLargas = "a".repeat(501); // 501 caracteres
  const datosPago = {
    id_orden_servicio: 1,
    monto: 1500000.00,
    metodo_pago: "Transferencia bancaria",
    fecha_pago: "2024-01-15",
    estado: "Completado",
    referencia: "TXN123456789",
    observaciones: observacionesLargas
  };

  // ACT
  const resultado = await crearPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('observaciones');
  expect(resultado.error.mensaje).toContain('500');
});
```

---

## 📝 ESTRUCTURA DE ARCHIVOS DE PRUEBA

```
tests/
├── unit/
│   ├── registro-usuario.test.js
│   ├── registro-pago.test.js
│   └── helpers/
│       ├── test-data.js          # Datos de prueba reutilizables
│       ├── mocks.js               # Mocks de servicios
│       └── assertions.js          # Funciones de aserción personalizadas
├── integration/
│   └── registro-completo.test.js  # Pruebas de flujo completo
└── setup/
    ├── jest.config.js             # Configuración de Jest
    └── test-db.js                  # Configuración de BD de prueba
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración Inicial
- [ ] Instalar dependencias de testing (Jest, Supertest, etc.)
- [ ] Configurar Jest en `jest.config.js`
- [ ] Configurar base de datos de prueba
- [ ] Crear archivos de setup y teardown

### Pruebas de Registro de Usuario
- [ ] Test: Crear usuario exitosamente
- [ ] Test: Validar campos requeridos
- [ ] Test: Validar formato de correo
- [ ] Test: Validar fortaleza de contraseña
- [ ] Test: Validar unicidad de documento
- [ ] Test: Validar unicidad de correo
- [ ] Test: Validar tipos de documento
- [ ] Test: Validar roles válidos
- [ ] Test: Validar formato de teléfono (si aplica)
- [ ] Test: Validar longitud de campos de texto

### Pruebas de Registro de Pago
- [ ] Test: Crear pago exitosamente
- [ ] Test: Validar campos requeridos
- [ ] Test: Validar monto mayor a cero
- [ ] Test: Validar formato de monto (decimales)
- [ ] Test: Validar existencia de orden de servicio
- [ ] Test: Validar métodos de pago permitidos
- [ ] Test: Validar estados de pago permitidos
- [ ] Test: Validar unicidad de referencia
- [ ] Test: Validar formato de fecha
- [ ] Test: Validar longitud de observaciones

### Calidad del Código
- [ ] Cobertura de código >= 80%
- [ ] Todas las pruebas pasan
- [ ] Documentación de pruebas
- [ ] Refactorización de código duplicado
- [ ] Uso de datos de prueba reutilizables

---

## 🎯 RESULTADO ESPERADO

Al finalizar, debes tener:

1. **Suite completa de pruebas unitarias** que cubra todos los casos mencionados
2. **Cobertura de código** superior al 80%
3. **Documentación clara** de cada prueba
4. **Código limpio y mantenible** siguiendo las mejores prácticas
5. **Datos de prueba reutilizables** para evitar duplicación
6. **Mocks apropiados** para servicios externos y base de datos

---

## 📚 NOTAS ADICIONALES

- Usa **describe** para agrupar pruebas relacionadas
- Usa **test** o **it** para casos individuales
- Sigue el patrón **AAA** (Arrange-Act-Assert)
- Usa nombres descriptivos para las pruebas
- Mantén las pruebas independientes entre sí
- Usa mocks para servicios externos
- Limpia los datos después de cada prueba
- Documenta casos edge y límites

---

## 🚀 COMANDOS PARA EJECUTAR PRUEBAS

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch

# Ejecutar pruebas con cobertura
npm test -- --coverage

# Ejecutar pruebas específicas
npm test -- registro-usuario.test.js

# Ejecutar pruebas en modo verbose
npm test -- --verbose
```

---

**¡IMPORTANTE!** Este prompt debe seguirse paso a paso, asegurando que cada prueba esté bien documentada y siga las mejores prácticas de testing con Jest.


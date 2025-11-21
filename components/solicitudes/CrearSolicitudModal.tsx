import { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { useClientes, useServicios } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Cliente, Servicio } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface CrearSolicitudModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TipoSolicitante = 'Natural' | 'Jurídica';
type TipoPersona = 'Natural' | 'Jurídica';

export default function CrearSolicitudModal({ visible, onClose, onSuccess }: CrearSolicitudModalProps) {
  // Estados principales
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [mostrarSelectorCliente, setMostrarSelectorCliente] = useState(false);

  // Estados del formulario
  const [tipoSolicitante, setTipoSolicitante] = useState<'Titular' | 'Representante Autorizado'>('Titular');
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>('Natural');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [pais, setPais] = useState('Colombia');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  // Campos específicos de marca
  const [nombreMarca, setNombreMarca] = useState('');
  const [tipoProductoServicio, setTipoProductoServicio] = useState('');
  const [logotipoMarca, setLogotipoMarca] = useState<string>('');

  // Campos para persona jurídica
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nit, setNit] = useState('');
  const [tipoEntidad, setTipoEntidad] = useState('');

  // Archivos
  const [poderAutorizacion, setPoderAutorizacion] = useState<string>('');
  const [certificadoCamara, setCertificadoCamara] = useState<string>('');

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const { servicios, loading: loadingServicios } = useServicios(visible);
  const { clientes, loading: loadingClientes } = useClientes(visible);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = useMemo(() => {
    const texto = busquedaCliente.trim().toLowerCase();
    if (!texto) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        c.apellido.toLowerCase().includes(texto) ||
        c.correo.toLowerCase().includes(texto) ||
        c.documento.toLowerCase().includes(texto)
    );
  }, [clientes, busquedaCliente]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!visible) {
      setServicioSeleccionado(null);
      setClienteSeleccionado(null);
      setBusquedaCliente('');
      setMostrarSelectorCliente(false);
      setTipoSolicitante('Titular');
      setTipoPersona('Natural');
      setNombres('');
      setApellidos('');
      setTipoDocumento('CC');
      setNumeroDocumento('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPais('Colombia');
      setCiudad('');
      setCodigoPostal('');
      setNombreMarca('');
      setTipoProductoServicio('');
      setLogotipoMarca('');
      setNombreEmpresa('');
      setNit('');
      setTipoEntidad('');
      setPoderAutorizacion('');
      setCertificadoCamara('');
    }
  }, [visible]);

  // Cargar datos del cliente seleccionado
  useEffect(() => {
    if (clienteSeleccionado) {
      setEmail(clienteSeleccionado.correo);
      setTelefono(clienteSeleccionado.telefono || '');
      setDireccion(clienteSeleccionado.direccion || '');
      setCiudad(clienteSeleccionado.ciudad || '');
      setTipoDocumento(clienteSeleccionado.tipo_documento || 'CC');
      setNumeroDocumento(clienteSeleccionado.documento);
      if (clienteSeleccionado.tipo_persona === 'Natural') {
        const partes = clienteSeleccionado.nombre.split(' ');
        setNombres(partes[0] || '');
        setApellidos(partes.slice(1).join(' ') || clienteSeleccionado.apellido);
      }
    }
  }, [clienteSeleccionado]);

  // Convertir archivo a base64
  const convertirArchivoABase64 = async (uri: string, mimeType: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Error al convertir archivo a base64');
    }
  };

  // Seleccionar imagen (logotipo)
  const seleccionarImagen = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = await convertirArchivoABase64(result.assets[0].uri, result.assets[0].mimeType || 'image/jpeg');
        setLogotipoMarca(base64);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'No se pudo seleccionar la imagen. Inténtalo de nuevo.',
        type: 'error',
      });
    }
  };

  // Seleccionar documento PDF
  const seleccionarDocumento = async (
    tipo: 'poderAutorizacion' | 'certificadoCamara',
    setter: (value: string) => void
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64 = await convertirArchivoABase64(result.assets[0].uri, 'application/pdf');
        setter(base64);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'No se pudo seleccionar el documento. Inténtalo de nuevo.',
        type: 'error',
      });
    }
  };

  // Validar formulario
  const validarFormulario = (): string | null => {
    if (!servicioSeleccionado) {
      return 'Debes seleccionar un servicio';
    }

    if (!clienteSeleccionado) {
      return 'Debes seleccionar un cliente';
    }

    // Validaciones básicas comunes
    if (!email.trim()) return 'El email es requerido';
    if (!telefono.trim()) return 'El teléfono es requerido';
    if (!direccion.trim()) return 'La dirección es requerida';
    if (!pais.trim()) return 'El país es requerido';
    if (!nombreMarca.trim()) return 'El nombre de la marca es requerido';

    // Validaciones según tipo de servicio
    const nombreServicio = servicioSeleccionado.nombre.toLowerCase();

    if (nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda')) {
      // Búsqueda de Antecedentes
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!numeroDocumento.trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      if (!tipoProductoServicio.trim()) return 'El tipo de producto/servicio es requerido';
      if (!logotipoMarca) return 'El logotipo de la marca es requerido';
    } else {
      // Otros servicios (Certificación, Renovación, etc.)
      if (tipoSolicitante === 'Titular') {
        if (tipoPersona === 'Natural') {
          if (!tipoDocumento) return 'El tipo de documento es requerido';
          if (!numeroDocumento.trim()) return 'El número de documento es requerido';
          if (!nombres.trim()) return 'Los nombres son requeridos';
          if (!apellidos.trim()) return 'Los apellidos son requeridos';
        } else {
          if (!nombreEmpresa.trim()) return 'El nombre de la empresa es requerido';
          if (!nit.trim()) return 'El NIT es requerido';
        }
      } else {
        // Representante Autorizado
        if (!tipoDocumento) return 'El tipo de documento es requerido';
        if (!numeroDocumento.trim()) return 'El número de documento es requerido';
        if (!nombres.trim()) return 'Los nombres son requeridos';
        if (!apellidos.trim()) return 'Los apellidos son requeridos';
      }

      if (!logotipoMarca) return 'El logotipo de la marca es requerido';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
      if (tipoPersona === 'Jurídica' && !certificadoCamara) {
        return 'El certificado de cámara de comercio es requerido para personas jurídicas';
      }
    }

    return null;
  };

  // Crear solicitud
  const handleCrear = async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setAlertConfig({
        visible: true,
        title: 'Campos requeridos',
        message: errorValidacion,
        type: 'error',
      });
      return;
    }

    if (!servicioSeleccionado || !clienteSeleccionado) return;

    setLoading(true);
    try {
      const payload: any = {
        id_cliente: clienteSeleccionado.id_cliente,
        pais: pais.trim(),
        ciudad: ciudad.trim(),
        correo: email.trim(),
        correoelectronico: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        nombredelamarca: nombreMarca.trim(),
        nombre_a_buscar: nombreMarca.trim(),
      };

      if (codigoPostal.trim()) {
        payload.codigo_postal = codigoPostal.trim();
      }

      const nombreServicio = servicioSeleccionado.nombre.toLowerCase();

      if (nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda')) {
        // Búsqueda de Antecedentes
        payload.tipo_documento = tipoDocumento;
        payload.numero_documento = numeroDocumento.trim();
        payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
        payload.tipo_producto_servicio = tipoProductoServicio.trim();
        if (logotipoMarca) {
          payload.logotipo = logotipoMarca;
        }
      } else {
        // Otros servicios
        payload.tipo_solicitante = tipoSolicitante;
        payload.tipodepersona = tipoPersona;
        payload.tipo_solicitante = tipoSolicitante;

        if (tipoSolicitante === 'Titular') {
          if (tipoPersona === 'Natural') {
            payload.tipo_documento = tipoDocumento;
            payload.numero_documento = numeroDocumento.trim();
            payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
          } else {
            payload.tipodeentidadrazonsocial = tipoEntidad.trim();
            payload.nombredelaempresa = nombreEmpresa.trim();
            payload.nit = nit.trim();
          }
        } else {
          // Representante Autorizado
          payload.tipo_documento = tipoDocumento;
          payload.numero_documento = numeroDocumento.trim();
          payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
        }

        if (logotipoMarca) {
          payload.logotipo = logotipoMarca;
        }
        if (poderAutorizacion) {
          payload.poder_autorizacion = poderAutorizacion;
          payload.poderparaelregistrodelamarca = poderAutorizacion;
        }
        if (certificadoCamara) {
          payload.certificado_camara_comercio = certificadoCamara;
        }
      }

      await solicitudesApiService.crearSolicitud(servicioSeleccionado.id_servicio || servicioSeleccionado.id || 0, payload);

      setAlertConfig({
        visible: true,
        title: 'Solicitud creada',
        message: 'La solicitud ha sido creada exitosamente.',
        type: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al crear solicitud',
        message: message || 'No se pudo crear la solicitud. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const nombreServicio = servicioSeleccionado?.nombre.toLowerCase() || '';
  const esBusquedaAntecedentes = nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda');

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
        onPress={handleCrear}
        disabled={loading}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Creando...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Crear Solicitud</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={visible} onClose={handleClose} title="Crear Nueva Solicitud" footer={footer}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Selector de Servicio */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Servicio <Text style={styles.required}>*</Text>
            </Text>
            {loadingServicios ? (
              <LoadingSpinner />
            ) : (
              <View style={styles.serviciosContainer}>
                {servicios.map((servicio) => (
                  <TouchableOpacity
                    key={servicio.id_servicio || servicio.id}
                    style={[
                      styles.servicioButton,
                      servicioSeleccionado?.id_servicio === servicio.id_servicio && styles.servicioButtonSelected,
                    ]}
                    onPress={() => setServicioSeleccionado(servicio)}>
                    <Text
                      style={[
                        styles.servicioButtonText,
                        servicioSeleccionado?.id_servicio === servicio.id_servicio && styles.servicioButtonTextSelected,
                      ]}>
                      {servicio.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Selector de Cliente */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Cliente <Text style={styles.required}>*</Text>
            </Text>
            {clienteSeleccionado ? (
              <View style={styles.clienteSeleccionadoBox}>
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteNombre}>
                    {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                  </Text>
                  <Text style={styles.clienteEmail}>{clienteSeleccionado.correo}</Text>
                  <Text style={styles.clienteDocumento}>
                    {clienteSeleccionado.tipo_documento}: {clienteSeleccionado.documento}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cambiarClienteButton}
                  onPress={() => {
                    setClienteSeleccionado(null);
                    setMostrarSelectorCliente(true);
                  }}>
                  <Text style={styles.cambiarClienteText}>Cambiar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar cliente por nombre, email o documento..."
                  placeholderTextColor={colors.gray}
                  value={busquedaCliente}
                  onChangeText={setBusquedaCliente}
                />
                {busquedaCliente.trim() && (
                  <View style={styles.clientesListContainer}>
                    <FlatList
                      data={clientesFiltrados.slice(0, 5)}
                      keyExtractor={(item) => item.id_cliente.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.clienteItem}
                          onPress={() => {
                            setClienteSeleccionado(item);
                            setBusquedaCliente('');
                            setMostrarSelectorCliente(false);
                          }}>
                          <Text style={styles.clienteItemNombre}>
                            {item.nombre} {item.apellido}
                          </Text>
                          <Text style={styles.clienteItemEmail}>{item.correo}</Text>
                        </TouchableOpacity>
                      )}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </>
            )}
          </View>

          {/* Formulario dinámico según servicio */}
          {servicioSeleccionado && (
            <>
              {/* Tipo de Solicitante (solo para servicios que no son Búsqueda) */}
              {!esBusquedaAntecedentes && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Tipo de Solicitante <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoSolicitante === 'Titular' && styles.radioButtonSelected]}
                      onPress={() => setTipoSolicitante('Titular')}>
                      <Text
                        style={[styles.radioText, tipoSolicitante === 'Titular' && styles.radioTextSelected]}>
                        Titular
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoSolicitante === 'Representante Autorizado' && styles.radioButtonSelected]}
                      onPress={() => setTipoSolicitante('Representante Autorizado')}>
                      <Text
                        style={[
                          styles.radioText,
                          tipoSolicitante === 'Representante Autorizado' && styles.radioTextSelected,
                        ]}>
                        Representante Autorizado
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Tipo de Persona (solo para Titular y servicios que no son Búsqueda) */}
              {!esBusquedaAntecedentes && tipoSolicitante === 'Titular' && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Tipo de Persona <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoPersona === 'Natural' && styles.radioButtonSelected]}
                      onPress={() => setTipoPersona('Natural')}>
                      <Text style={[styles.radioText, tipoPersona === 'Natural' && styles.radioTextSelected]}>
                        Natural
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoPersona === 'Jurídica' && styles.radioButtonSelected]}
                      onPress={() => setTipoPersona('Jurídica')}>
                      <Text style={[styles.radioText, tipoPersona === 'Jurídica' && styles.radioTextSelected]}>
                        Jurídica
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Campos de Persona Natural */}
              {(esBusquedaAntecedentes || tipoPersona === 'Natural' || tipoSolicitante === 'Representante Autorizado') && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombres <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombres"
                      value={nombres}
                      onChangeText={setNombres}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Apellidos <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Apellidos"
                      value={apellidos}
                      onChangeText={setApellidos}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Tipo de Documento <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.selectGroup}>
                      {['CC', 'CE', 'TI', 'PAS'].map((tipo) => (
                        <TouchableOpacity
                          key={tipo}
                          style={[styles.selectButton, tipoDocumento === tipo && styles.selectButtonSelected]}
                          onPress={() => setTipoDocumento(tipo)}>
                          <Text
                            style={[styles.selectButtonText, tipoDocumento === tipo && styles.selectButtonTextSelected]}>
                            {tipo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Documento <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de documento"
                      value={numeroDocumento}
                      onChangeText={setNumeroDocumento}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos de Persona Jurídica */}
              {!esBusquedaAntecedentes && tipoSolicitante === 'Titular' && tipoPersona === 'Jurídica' && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombre de la Empresa <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Razón social"
                      value={nombreEmpresa}
                      onChangeText={setNombreEmpresa}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      NIT <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="NIT"
                      value={nit}
                      onChangeText={setNit}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>Tipo de Entidad</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="S.A.S, S.A., LTDA, etc."
                      value={tipoEntidad}
                      onChangeText={setTipoEntidad}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos comunes de contacto */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  Teléfono <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="3001234567"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  Dirección <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Calle, número, barrio"
                  value={direccion}
                  onChangeText={setDireccion}
                  editable={!loading}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  País <Text style={styles.required}>*</Text>
                </Text>
                <TextInput style={styles.input} placeholder="Colombia" value={pais} onChangeText={setPais} editable={!loading} />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput style={styles.input} placeholder="Bogotá" value={ciudad} onChangeText={setCiudad} editable={!loading} />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="110111"
                  value={codigoPostal}
                  onChangeText={setCodigoPostal}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              {/* Campos de marca */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Nombre de la Marca <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la marca a registrar"
                  value={nombreMarca}
                  onChangeText={setNombreMarca}
                  editable={!loading}
                />
              </View>

              {esBusquedaAntecedentes && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Tipo de Producto/Servicio <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Software y servicios tecnológicos"
                    value={tipoProductoServicio}
                    onChangeText={setTipoProductoServicio}
                    editable={!loading}
                  />
                </View>
              )}

              {/* Archivos */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Logotipo de la Marca <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={styles.fileButton} onPress={seleccionarImagen} disabled={loading}>
                  <Text style={styles.fileButtonText}>
                    {logotipoMarca ? '✓ Imagen seleccionada' : '📷 Seleccionar Imagen'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!esBusquedaAntecedentes && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Poder de Autorización <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {tipoPersona === 'Jurídica' && (
                    <View style={styles.section}>
                      <Text style={styles.label}>
                        Certificado de Cámara de Comercio <Text style={styles.required}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => seleccionarDocumento('certificadoCamara', setCertificadoCamara)}
                        disabled={loading}>
                        <Text style={styles.fileButtonText}>
                          {certificadoCamara ? '✓ Documento seleccionado' : '📄 Seleccionar PDF'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  section: {
    marginBottom: 20,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  required: {
    color: colors.danger,
  },
  serviciosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  servicioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
  },
  servicioButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  servicioButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  servicioButtonTextSelected: {
    color: '#FFFFFF',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    backgroundColor: '#FFFFFF',
  },
  clientesListContainer: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  clienteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clienteItemNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  clienteItemEmail: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  clienteSeleccionadoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  clienteEmail: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  clienteDocumento: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  cambiarClienteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  cambiarClienteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  radioTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.primaryDark,
    backgroundColor: '#FFFFFF',
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
  fileButton: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});


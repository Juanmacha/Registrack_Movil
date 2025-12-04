import { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { useSolicitudDetalle } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Solicitud, SolicitudDetalle } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from './Modal';

interface EditarSolicitudModalProps {
  visible: boolean;
  solicitud: Solicitud | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarSolicitudModal({
  visible,
  solicitud,
  onClose,
  onSuccess,
}: EditarSolicitudModalProps) {
  // Estados del formulario
  const [pais, setPais] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [tipoPersona, setTipoPersona] = useState<'Natural' | 'Jurídica'>('Natural');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Campos para persona jurídica
  const [tipoEntidad, setTipoEntidad] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nit, setNit] = useState('');

  // Archivos
  const [poderRepresentante, setPoderRepresentante] = useState<string>('');
  const [poderAutorizacion, setPoderAutorizacion] = useState<string>('');

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

  const { data: detalle, loading: loadingDetalle, refetch: refetchDetalle } = useSolicitudDetalle(
    solicitud?.id_orden_servicio || null,
    visible && solicitud !== null
  );

  // Cargar datos del detalle cuando se abre el modal
  useEffect(() => {
    if (visible && solicitud) {
      refetchDetalle();
    }
  }, [visible, solicitud, refetchDetalle]);

  // Prellenar formulario con datos del detalle
  useEffect(() => {
    if (detalle) {
      setPais(detalle.pais || '');
      setCiudad(detalle.ciudad || '');
      setCodigoPostal(detalle.codigo_postal || '');
      setTipoPersona((detalle.tipoPersona as 'Natural' | 'Jurídica') || 'Natural');
      setTipoDocumento(detalle.tipoDocumento || 'CC');
      setNumeroDocumento(detalle.numeroDocumento || '');
      setEmail(detalle.email || '');
      setTelefono(detalle.telefono || '');
      setDireccion(detalle.direccion || '');

      // Separar nombre completo en nombres y apellidos
      const nombreCompleto = detalle.titular || detalle.nombreCompleto || '';
      const partes = nombreCompleto.split(' ');
      if (partes.length > 0) {
        setNombres(partes[0] || '');
        setApellidos(partes.slice(1).join(' ') || '');
      }

      // Campos de persona jurídica
      setTipoEntidad(detalle.tipoEntidad || '');
      setNombreEmpresa(detalle.nombreEmpresa || '');
      setNit(detalle.nit || '');
    }
  }, [detalle]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!visible) {
      setPais('');
      setCiudad('');
      setCodigoPostal('');
      setTipoPersona('Natural');
      setTipoDocumento('CC');
      setNumeroDocumento('');
      setNombres('');
      setApellidos('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setTipoEntidad('');
      setNombreEmpresa('');
      setNit('');
      setPoderRepresentante('');
      setPoderAutorizacion('');
    }
  }, [visible]);

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

  // Seleccionar documento PDF
  const seleccionarDocumento = async (
    tipo: 'poderRepresentante' | 'poderAutorizacion',
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
    if (!email.trim()) return 'El email es requerido';
    if (!telefono.trim()) return 'El teléfono es requerido';
    if (!direccion.trim()) return 'La dirección es requerida';
    if (!pais.trim()) return 'El país es requerido';

    if (tipoPersona === 'Natural') {
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
    } else {
      if (!nombreEmpresa.trim()) return 'El nombre de la empresa es requerido';
      if (!nit.trim()) return 'El NIT es requerido';
    }

    return null;
  };

  // Editar solicitud
  const handleEditar = async () => {
    if (!solicitud) return;

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

    setLoading(true);
    try {
      const payload: any = {
        pais: pais.trim(),
        ciudad: ciudad.trim(),
        tipodepersona: tipoPersona,
        correoelectronico: email.trim(),
        correo: email.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
      };

      if (codigoPostal.trim()) {
        payload.codigo_postal = codigoPostal.trim();
      }

      if (tipoPersona === 'Natural') {
        payload.tipodedocumento = tipoDocumento;
        payload.numerodedocumento = String(numeroDocumento || '').trim();
        payload.nombrecompleto = `${nombres.trim()} ${apellidos.trim()}`.trim();
      } else {
        payload.tipodeentidadrazonsocial = tipoEntidad.trim();
        payload.nombredelaempresa = nombreEmpresa.trim();
        payload.nit = nit.trim();
      }

      if (poderRepresentante) {
        payload.poderdelrepresentanteautorizado = poderRepresentante;
      }

      if (poderAutorizacion) {
        payload.poderparaelregistrodelamarca = poderAutorizacion;
      }

      await solicitudesApiService.editarSolicitud(solicitud.id_orden_servicio, payload);

      setAlertConfig({
        visible: true,
        title: 'Solicitud actualizada',
        message: 'La solicitud ha sido actualizada exitosamente.',
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
        title: 'Error al actualizar solicitud',
        message: message || 'No se pudo actualizar la solicitud. Inténtalo de nuevo.',
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

  if (!solicitud) {
    return null;
  }

  const puedeEditar = !['Finalizada', 'Finalizado', 'Anulada', 'Anulado', 'Rechazada', 'Rechazado'].includes(
    solicitud.estado
  );

  if (!puedeEditar) {
    return (
      <Modal visible={visible} onClose={handleClose} title={`Editar Solicitud - ${solicitud.expediente}`}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Esta solicitud no puede ser editada porque está en estado "{solicitud.estado}".
          </Text>
          <Text style={styles.errorSubtext}>
            Solo se pueden editar solicitudes que no estén finalizadas, anuladas o rechazadas.
          </Text>
        </View>
      </Modal>
    );
  }

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
        onPress={handleEditar}
        disabled={loading}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Actualizando...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={visible} onClose={handleClose} title={`Editar Solicitud - ${solicitud.expediente}`} footer={footer}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {loadingDetalle ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Información de solo lectura */}
              <View style={styles.readOnlySection}>
                <Text style={styles.readOnlyLabel}>Expediente:</Text>
                <Text style={styles.readOnlyValue}>{solicitud.expediente}</Text>
              </View>

              <View style={styles.readOnlySection}>
                <Text style={styles.readOnlyLabel}>Servicio:</Text>
                <Text style={styles.readOnlyValue}>{solicitud.tipoSolicitud}</Text>
              </View>

              <View style={styles.readOnlySection}>
                <Text style={styles.readOnlyLabel}>Estado:</Text>
                <Text style={styles.readOnlyValue}>{solicitud.estado}</Text>
              </View>

              {/* Tipo de Persona */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Tipo de Persona <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[styles.radioButton, tipoPersona === 'Natural' && styles.radioButtonSelected]}
                    onPress={() => setTipoPersona('Natural')}
                    disabled={loading}>
                    <Text style={[styles.radioText, tipoPersona === 'Natural' && styles.radioTextSelected]}>
                      Natural
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.radioButton, tipoPersona === 'Jurídica' && styles.radioButtonSelected]}
                    onPress={() => setTipoPersona('Jurídica')}
                    disabled={loading}>
                    <Text style={[styles.radioText, tipoPersona === 'Jurídica' && styles.radioTextSelected]}>
                      Jurídica
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campos de Persona Natural */}
              {tipoPersona === 'Natural' && (
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
                          onPress={() => setTipoDocumento(tipo)}
                          disabled={loading}>
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
              {tipoPersona === 'Jurídica' && (
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

              {/* Archivos opcionales */}
              <View style={styles.section}>
                <Text style={styles.label}>Poder del Representante Autorizado</Text>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => seleccionarDocumento('poderRepresentante', setPoderRepresentante)}
                  disabled={loading}>
                  <Text style={styles.fileButtonText}>
                    {poderRepresentante ? '✓ Documento seleccionado' : '📄 Seleccionar PDF (Opcional)'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Poder para el Registro de la Marca</Text>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                  disabled={loading}>
                  <Text style={styles.fileButtonText}>
                    {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF (Opcional)'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  readOnlySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
    flex: 1,
  },
  readOnlyValue: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '700',
    flex: 2,
    textAlign: 'right',
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


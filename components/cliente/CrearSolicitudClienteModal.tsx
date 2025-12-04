import { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/contexts/AuthContext';
import { useServicios } from '@/hooks/useSolicitudes';
import { solicitudesApiService } from '@/services/solicitudesApiService';
import { colors } from '@/styles/authStyles';
import { Servicio } from '@/types/solicitudes';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';

import CustomAlert from '../CustomAlert';
import LoadingSpinner from '../dashboard/LoadingSpinner';
import Modal from '../solicitudes/Modal';

interface CrearSolicitudClienteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TipoPersona = 'Natural' | 'Jurídica';

export default function CrearSolicitudClienteModal({ visible, onClose, onSuccess }: CrearSolicitudClienteModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estados principales
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

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
  const [representanteLegal, setRepresentanteLegal] = useState('');

  // Campos para Renovación de Marca
  const [numeroExpedienteMarca, setNumeroExpedienteMarca] = useState('');
  const [certificadoRenovacion, setCertificadoRenovacion] = useState<string>('');
  const [claseNiza, setClaseNiza] = useState('');

  // Campos para Cesión de Marca (Cesionario)
  const [nombreRazonSocialCesionario, setNombreRazonSocialCesionario] = useState('');
  const [nitCesionario, setNitCesionario] = useState('');
  const [representanteLegalCesionario, setRepresentanteLegalCesionario] = useState('');
  const [tipoDocumentoCesionario, setTipoDocumentoCesionario] = useState('CC');
  const [numeroDocumentoCesionario, setNumeroDocumentoCesionario] = useState('');
  const [correoCesionario, setCorreoCesionario] = useState('');
  const [telefonoCesionario, setTelefonoCesionario] = useState('');
  const [direccionCesionario, setDireccionCesionario] = useState('');
  const [documentoCesion, setDocumentoCesion] = useState<string>('');

  // Campos para Presentación de Oposición
  const [marcaAOponerse, setMarcaAOponerse] = useState('');
  const [argumentosRespuesta, setArgumentosRespuesta] = useState('');
  const [documentosOposicion, setDocumentosOposicion] = useState<string>('');

  // Campos para Respuesta a Oposición
  const [marcaOpositora, setMarcaOpositora] = useState('');

  // Campos para Ampliación de Alcance
  const [documentoNitTitular, setDocumentoNitTitular] = useState('');
  const [numeroRegistroExistente, setNumeroRegistroExistente] = useState('');
  const [claseNizaActual, setClaseNizaActual] = useState('');
  const [nuevasClasesNiza, setNuevasClasesNiza] = useState('');
  const [descripcionNuevosProductosServicios, setDescripcionNuevosProductosServicios] = useState('');
  const [soportes, setSoportes] = useState<string>('');

  // Archivos
  const [poderAutorizacion, setPoderAutorizacion] = useState<string>('');
  const [certificadoCamara, setCertificadoCamara] = useState<string>('');

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [montoAPagar, setMontoAPagar] = useState<number | null>(null);
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

  // Prellenar campos con datos del usuario
  useEffect(() => {
    if (visible && user) {
      setNombres(user.nombre || '');
      setApellidos(user.apellido || '');
      setEmail(user.correo || '');
      setTelefono(user.telefono || '');
      setTipoDocumento(user.tipo_documento || 'CC');
      setNumeroDocumento(String(user.documento || ''));
      
      // Campos adicionales si están disponibles en el usuario
      if (user.direccion) setDireccion(user.direccion);
      if (user.ciudad) setCiudad(user.ciudad);
    }
  }, [visible, user]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!visible) {
      setServicioSeleccionado(null);
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
      setRepresentanteLegal('');
      setNumeroExpedienteMarca('');
      setCertificadoRenovacion('');
      setClaseNiza('');
      setNombreRazonSocialCesionario('');
      setNitCesionario('');
      setRepresentanteLegalCesionario('');
      setTipoDocumentoCesionario('CC');
      setNumeroDocumentoCesionario('');
      setCorreoCesionario('');
      setTelefonoCesionario('');
      setDireccionCesionario('');
      setDocumentoCesion('');
      setMarcaAOponerse('');
      setArgumentosRespuesta('');
      setDocumentosOposicion('');
      setMarcaOpositora('');
      setDocumentoNitTitular('');
      setNumeroRegistroExistente('');
      setClaseNizaActual('');
      setNuevasClasesNiza('');
      setDescripcionNuevosProductosServicios('');
      setSoportes('');
      setPoderAutorizacion('');
      setCertificadoCamara('');
      setShowPaymentModal(false);
      setCreatedOrderId(null);
      setMontoAPagar(null);
    }
  }, [visible]);

  // Validar archivo (tamaño y formato)
  const validarArchivo = (fileSize: number, mimeType: string, fileName: string): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (fileSize > maxSize) {
      return `El archivo ${fileName} excede el tamaño máximo de 5MB`;
    }
    
    if (!allowedTypes.includes(mimeType)) {
      return `El archivo ${fileName} debe ser PDF, JPG o PNG`;
    }
    
    return null;
  };

  // Convertir archivo a base64
  const convertirArchivoABase64 = async (uri: string, mimeType: string, fileName: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const errorValidacion = validarArchivo(blob.size, mimeType, fileName);
      if (errorValidacion) {
        throw new Error(errorValidacion);
      }
      
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
      throw error;
    }
  };

  // Seleccionar imagen (logotipo)
  const seleccionarImagen = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'imagen.jpg';
        const mimeType = asset.mimeType || 'image/jpeg';
        const base64 = await convertirArchivoABase64(asset.uri, mimeType, fileName);
        setLogotipoMarca(base64);
      }
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: error.message || 'No se pudo seleccionar la imagen. Inténtalo de nuevo.',
        type: 'error',
      });
    }
  };

  // Seleccionar documento PDF o imagen
  const seleccionarDocumento = async (
    tipo: 'poderAutorizacion' | 'certificadoCamara' | 'certificadoRenovacion' | 'documentoCesion' | 'documentosOposicion' | 'soportes',
    setter: (value: string) => void
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.name || 'documento.pdf';
        let mimeType = 'application/pdf';
        if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (fileName.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        }
        const base64 = await convertirArchivoABase64(asset.uri, mimeType, fileName);
        setter(base64);
      }
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: error.message || 'No se pudo seleccionar el documento. Inténtalo de nuevo.',
        type: 'error',
      });
    }
  };

  // Validar formulario según tipo de servicio (reutilizar lógica del modal de admin)
  const validarFormulario = (): string | null => {
    if (!servicioSeleccionado) {
      return 'Debes seleccionar un servicio';
    }

    const nombreServicio = servicioSeleccionado.nombre.toLowerCase();

    // Validaciones comunes
    if (!email.trim()) return 'El email es requerido';
    if (!telefono.trim()) return 'El teléfono es requerido';
    if (!direccion.trim()) return 'La dirección es requerida';
    if (!pais.trim()) return 'El país es requerido';
    if (!nombreMarca.trim()) return 'El nombre de la marca es requerido';

    // Validaciones específicas por servicio (reutilizar misma lógica del modal de admin)
    if (nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda')) {
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      if (!tipoProductoServicio.trim()) return 'El tipo de producto/servicio es requerido';
      if (!logotipoMarca) return 'El logotipo de la marca es requerido';
    } else if (nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) {
      if (!tipoPersona || (tipoPersona !== 'Natural' && tipoPersona !== 'Jurídica')) {
        return 'El tipo de solicitante es requerido (Natural o Jurídica)';
      }
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      if (!email.trim()) return 'El correo electrónico es requerido';
      if (!telefono.trim()) return 'El teléfono es requerido';
      if (!direccion.trim()) return 'La dirección es requerida';
      if (!pais.trim()) return 'El país es requerido';
      if (!nombreMarca.trim()) return 'El nombre de la marca es requerido';
      if (!numeroExpedienteMarca.trim()) return 'El número de expediente de la marca es requerido';
      if (!certificadoRenovacion) return 'El certificado de renovación es requerido';
      if (!logotipoMarca) return 'El logotipo de la marca es requerido';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
      
      if (tipoPersona === 'Jurídica') {
        if (!tipoEntidad.trim()) return 'El tipo de entidad es requerido para persona jurídica';
        if (!nombreEmpresa.trim()) return 'La razón social es requerida para persona jurídica';
        if (!nit.trim()) return 'El NIT es requerido para persona jurídica';
        if (!representanteLegal.trim()) return 'El representante legal es requerido para persona jurídica';
      }
    } else if (nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) {
      if (!tipoPersona || (tipoPersona !== 'Natural' && tipoPersona !== 'Jurídica')) {
        return 'El tipo de solicitante es requerido (Natural o Jurídica)';
      }
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      
      if (tipoPersona === 'Jurídica') {
        if (!tipoEntidad.trim()) return 'El tipo de entidad es requerido para persona jurídica';
        if (!nombreEmpresa.trim()) return 'La razón social es requerida para persona jurídica';
        if (!nit.trim()) return 'El NIT es requerido para persona jurídica';
        if (!representanteLegal.trim()) return 'El representante legal es requerido para persona jurídica';
      }
      if (!nombreMarca.trim()) return 'El nombre de la marca es requerido';
      if (!numeroExpedienteMarca.trim()) return 'El número de expediente de la marca es requerido';
      if (!documentoCesion) return 'El documento de cesión es requerido';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
      if (!nombreRazonSocialCesionario.trim()) return 'El nombre o razón social del cesionario es requerido';
      if (!nitCesionario.trim()) return 'El NIT del cesionario es requerido';
      if (!representanteLegalCesionario.trim()) return 'El representante legal del cesionario es requerido';
      if (!tipoDocumentoCesionario) return 'El tipo de documento del cesionario es requerido';
      if (!String(numeroDocumentoCesionario || '').trim()) return 'El número de documento del cesionario es requerido';
      if (!correoCesionario.trim()) return 'El correo del cesionario es requerido';
      if (!telefonoCesionario.trim()) return 'El teléfono del cesionario es requerido';
      if (!direccionCesionario.trim()) return 'La dirección del cesionario es requerida';
    } else if ((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta')) {
      if (!tipoPersona || (tipoPersona !== 'Natural' && tipoPersona !== 'Jurídica')) {
        return 'El tipo de solicitante es requerido (Natural o Jurídica)';
      }
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      if (!nit.trim()) return 'El NIT es requerido (requisito legal para oposición)';
      
      if (tipoPersona === 'Jurídica') {
        if (!tipoEntidad.trim()) return 'El tipo de entidad es requerido para persona jurídica';
        if (!nombreEmpresa.trim()) return 'La razón social es requerida para persona jurídica';
        if (!representanteLegal.trim()) return 'El representante legal es requerido para persona jurídica';
      }
      if (!marcaAOponerse.trim()) return 'El nombre de la marca a la que se opone es requerido';
      if (!argumentosRespuesta.trim() || argumentosRespuesta.trim().length < 10) {
        return 'Los argumentos de oposición son requeridos (mínimo 10 caracteres)';
      }
      if (!documentosOposicion) return 'Los documentos de oposición son requeridos';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
    } else if (nombreServicio.includes('respuesta') && nombreServicio.includes('oposición')) {
      if (!tipoDocumento) return 'El tipo de documento es requerido';
      if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
      if (!nombres.trim()) return 'Los nombres son requeridos';
      if (!apellidos.trim()) return 'Los apellidos son requeridos';
      if (!nombreEmpresa.trim()) return 'La razón social es requerida';
      if (!nit.trim()) return 'El NIT es requerido';
      if (!representanteLegal.trim()) return 'El representante legal es requerido';
      if (!numeroExpedienteMarca.trim()) return 'El número de expediente de la marca es requerido';
      if (!marcaOpositora.trim()) return 'El nombre de la marca opositora es requerido';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
    } else if (nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion')) {
      if (!documentoNitTitular.trim()) return 'El documento o NIT del titular es requerido';
      if (!email.trim()) return 'El email es requerido';
      if (!telefono.trim()) return 'El teléfono es requerido';
      if (!direccion.trim()) return 'La dirección es requerida';
      if (!ciudad.trim()) return 'La ciudad es requerida';
      if (!pais.trim()) return 'El país es requerido';
      if (!nombreMarca.trim()) return 'El nombre de la marca es requerido';
      if (!numeroRegistroExistente.trim()) return 'El número de registro existente es requerido';
      if (!claseNizaActual.trim()) return 'La clase Niza actual es requerida';
      if (!nuevasClasesNiza.trim()) return 'Las nuevas clases Niza son requeridas';
      if (!descripcionNuevosProductosServicios.trim() || descripcionNuevosProductosServicios.trim().length < 10) {
        return 'La descripción de nuevos productos/servicios es requerida (mínimo 10 caracteres)';
      }
      if (!soportes) return 'Los soportes son requeridos';
    } else {
      // Otros servicios (Certificación, etc.)
      if (!tipoSolicitante) return 'El tipo de solicitante es requerido';
      if (tipoSolicitante === 'Titular') {
        if (tipoPersona === 'Natural') {
          if (!tipoDocumento) return 'El tipo de documento es requerido';
          if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
          if (!nombres.trim()) return 'Los nombres son requeridos';
          if (!apellidos.trim()) return 'Los apellidos son requeridos';
        } else {
          if (!nombreEmpresa.trim()) return 'El nombre de la empresa es requerido';
          if (!nit.trim()) return 'El NIT es requerido';
          if (!representanteLegal.trim()) return 'El representante legal es requerido';
          if (!certificadoCamara) return 'El certificado de cámara de comercio es requerido para personas jurídicas';
        }
      } else {
        if (!tipoDocumento) return 'El tipo de documento es requerido';
        if (!String(numeroDocumento || '').trim()) return 'El número de documento es requerido';
        if (!nombres.trim()) return 'Los nombres son requeridos';
        if (!apellidos.trim()) return 'Los apellidos son requeridos';
      }
      if (!logotipoMarca) return 'El logotipo de la marca es requerido';
      if (!poderAutorizacion) return 'El poder de autorización es requerido';
    }

    return null;
  };

  // Transformar datos según tipo de servicio (SIN id_cliente - se toma del token)
  const transformarDatosParaAPI = (): any => {
    const payload: any = {
      // ⚠️ IMPORTANTE: NO incluir id_cliente - se toma automáticamente del token
      pais: pais.trim(),
      correo: email.trim(),
      correoelectronico: email.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
    };

    if (codigoPostal.trim()) {
      payload.codigo_postal = codigoPostal.trim();
    }

    const nombreServicio = servicioSeleccionado!.nombre.toLowerCase();

    // Reutilizar misma lógica de transformación del modal de admin
    if (nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda')) {
      payload.tipo_documento = tipoDocumento;
      payload.numero_documento = String(numeroDocumento || '').trim();
      payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      payload.nombre_a_buscar = nombreMarca.trim();
      payload.tipo_producto_servicio = tipoProductoServicio.trim();
      if (ciudad.trim()) payload.ciudad = ciudad.trim();
      if (logotipoMarca) payload.logotipo = logotipoMarca;
    } else if (nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) {
      payload.tipo_solicitante = tipoPersona;
      payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      payload.tipo_documento = tipoDocumento;
      payload.numero_documento = String(numeroDocumento || '').trim();
      payload.nombre_marca = nombreMarca.trim();
      payload.numero_expediente_marca = numeroExpedienteMarca.trim();
      
      if (poderAutorizacion) payload.poder_autorizacion = poderAutorizacion;
      if (certificadoRenovacion) payload.certificado_renovacion = certificadoRenovacion;
      if (logotipoMarca) payload.logotipo = logotipoMarca;
      
      if (tipoPersona === 'Jurídica') {
        payload.tipo_entidad = tipoEntidad.trim();
        payload.razon_social = nombreEmpresa.trim();
        const nitNum = nit.trim().replace(/-/g, '').replace(/\s/g, '');
        payload.nit_empresa = parseInt(nitNum) || 0;
        payload.representante_legal = representanteLegal.trim();
      }
    } else if (nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) {
      payload.tipo_solicitante = tipoPersona;
      payload.nombre_marca = nombreMarca.trim();
      payload.numero_expediente_marca = numeroExpedienteMarca.trim();
      payload.tipo_documento = tipoDocumento;
      payload.numero_documento = String(numeroDocumento || '').trim();
      payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      
      if (tipoPersona === 'Jurídica') {
        payload.tipo_entidad = tipoEntidad.trim();
        payload.razon_social = nombreEmpresa.trim();
        payload.nit_empresa = parseInt(nit.trim().replace(/[^0-9]/g, ''));
        payload.representante_legal = representanteLegal.trim();
      }
      
      if (ciudad.trim()) payload.ciudad = ciudad.trim();
      if (documentoCesion) payload.documento_cesion = documentoCesion;
      if (poderAutorizacion) {
        payload.poder_autorizacion = poderAutorizacion;
        payload.poderparaelregistrodelamarca = poderAutorizacion;
      }
      payload.nombre_razon_social_cesionario = nombreRazonSocialCesionario.trim();
      payload.nit_cesionario = nitCesionario.trim();
      payload.representante_legal_cesionario = representanteLegalCesionario.trim();
      payload.tipo_documento_cesionario = tipoDocumentoCesionario;
      payload.numero_documento_cesionario = String(numeroDocumentoCesionario || '').trim();
      payload.correo_cesionario = correoCesionario.trim();
      payload.telefono_cesionario = telefonoCesionario.trim();
      payload.direccion_cesionario = direccionCesionario.trim();
    } else if ((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta')) {
      payload.tipo_solicitante = tipoPersona;
      payload.nombre_marca = nombreMarca.trim();
      payload.marca_a_oponerse = marcaAOponerse.trim();
      payload.argumentos_respuesta = argumentosRespuesta.trim();
      payload.nit_empresa = parseInt(nit.trim().replace(/[^0-9]/g, ''));
      payload.tipo_documento = tipoDocumento;
      payload.numero_documento = String(numeroDocumento || '').trim();
      payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      
      if (tipoPersona === 'Jurídica') {
        payload.tipo_entidad = tipoEntidad.trim();
        payload.razon_social = nombreEmpresa.trim();
        payload.representante_legal = representanteLegal.trim();
      }
      
      if (ciudad.trim()) payload.ciudad = ciudad.trim();
      if (documentosOposicion) payload.documentos_oposicion = documentosOposicion;
      if (poderAutorizacion) {
        payload.poder_autorizacion = poderAutorizacion;
        payload.poderparaelregistrodelamarca = poderAutorizacion;
      }
    } else if (nombreServicio.includes('respuesta') && nombreServicio.includes('oposición')) {
      payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      payload.tipo_documento = tipoDocumento;
      payload.numero_documento = String(numeroDocumento || '').trim();
      payload.razon_social = nombreEmpresa.trim();
      payload.nit_empresa = parseInt(nit.trim());
      payload.representante_legal = representanteLegal.trim();
      payload.nombre_marca = nombreMarca.trim();
      payload.numero_expediente_marca = numeroExpedienteMarca.trim();
      payload.marca_opositora = marcaOpositora.trim();
      if (ciudad.trim()) payload.ciudad = ciudad.trim();
      if (poderAutorizacion) {
        payload.poder_autorizacion = poderAutorizacion;
        payload.poderparaelregistrodelamarca = poderAutorizacion;
      }
    } else if (nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion')) {
      payload.documento_nit_titular = documentoNitTitular.trim();
      payload.ciudad = ciudad.trim();
      payload.numero_registro_existente = numeroRegistroExistente.trim();
      payload.nombre_marca = nombreMarca.trim();
      payload.clase_niza_actual = claseNizaActual.trim();
      payload.nuevas_clases_niza = nuevasClasesNiza.trim();
      payload.descripcion_nuevos_productos_servicios = descripcionNuevosProductosServicios.trim();
      if (soportes) payload.soportes = soportes;
    } else {
      payload.tipo_solicitante = tipoSolicitante;
      payload.nombredelamarca = nombreMarca.trim();
      payload.nombre_a_buscar = nombreMarca.trim();
      
      if (tipoSolicitante === 'Titular') {
        payload.tipodepersona = tipoPersona;
        if (tipoPersona === 'Natural') {
          payload.tipo_documento = tipoDocumento;
          payload.numero_documento = String(numeroDocumento || '').trim();
          payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
        } else {
          payload.tipodeentidadrazonsocial = tipoEntidad.trim();
          payload.nombredelaempresa = nombreEmpresa.trim();
          payload.nit = nit.trim();
          payload.representante_legal = representanteLegal.trim();
        }
      } else {
        payload.tipo_documento = tipoDocumento;
        payload.numero_documento = String(numeroDocumento || '').trim();
        payload.nombres_apellidos = `${nombres.trim()} ${apellidos.trim()}`.trim();
      }
      
      if (ciudad.trim()) payload.ciudad = ciudad.trim();
      if (logotipoMarca) payload.logotipo = logotipoMarca;
      if (poderAutorizacion) {
        payload.poder_autorizacion = poderAutorizacion;
        payload.poderparaelregistrodelamarca = poderAutorizacion;
      }
      if (certificadoCamara && tipoPersona === 'Jurídica') {
        payload.certificado_camara_comercio = certificadoCamara;
      }
    }

    return payload;
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

    if (!servicioSeleccionado) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Debes seleccionar un servicio',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = transformarDatosParaAPI();
      const servicioId = servicioSeleccionado.id_servicio || servicioSeleccionado.id || 0;
      
      if (!servicioId || servicioId === 0) {
        throw new Error('No se pudo obtener el ID del servicio seleccionado');
      }

      const response = await solicitudesApiService.crearSolicitud(servicioId, payload);
      
      // La respuesta debe incluir orden_id y monto_a_pagar
      const ordenId = response.data?.orden_id || response.data?.id_orden_servicio || response.data?.id;
      const monto = response.data?.monto_a_pagar || response.data?.servicio?.precio_base || null;

      if (!ordenId) {
        throw new Error('No se recibió el ID de la orden de servicio');
      }

      setCreatedOrderId(ordenId);
      setMontoAPagar(monto);
      setShowPaymentModal(true);
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

  // Procesar pago
  const handleProcesarPago = async () => {
    if (!createdOrderId) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'No se encontró la orden de servicio',
        type: 'error',
      });
      return;
    }

    setProcessingPayment(true);
    try {
      await solicitudesApiService.procesarPago(createdOrderId, 'Tarjeta', montoAPagar || undefined);
      
      setAlertConfig({
        visible: true,
        title: 'Pago procesado',
        message: 'El pago se ha procesado exitosamente. Tu solicitud ha sido activada.',
        type: 'success',
      });

      setTimeout(() => {
        setShowPaymentModal(false);
        onSuccess();
        onClose();
        // Redirigir a Mis Procesos
        router.push('/(tabs)/mis-procesos');
      }, 2000);
    } catch (error) {
      const message = obtenerMensajeErrorUsuario(error as any);
      setAlertConfig({
        visible: true,
        title: 'Error al procesar pago',
        message: message || 'No se pudo procesar el pago. Inténtalo de nuevo.',
        type: 'error',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    if (!loading && !processingPayment) {
      onClose();
    }
  };

  const nombreServicio = servicioSeleccionado?.nombre.toLowerCase() || '';
  const esBusquedaAntecedentes = nombreServicio.includes('búsqueda') || nombreServicio.includes('busqueda');
  const esAmpliacion = nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion');

  // Renderizar formulario dinámico (reutilizar misma estructura del modal de admin)
  // Por limitaciones de tamaño, el render completo se incluirá en la siguiente parte
  // Por ahora, incluir estructura básica y continuar después

  const footer = (
    <View style={styles.footer}>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading || processingPayment}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.confirmButton, (loading || processingPayment) && styles.buttonDisabled]}
        onPress={handleCrear}
        disabled={loading || processingPayment}>
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
      <Modal visible={visible && !showPaymentModal} onClose={handleClose} title="Crear Nueva Solicitud" footer={footer}>
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

          {/* Formulario dinámico según servicio */}
          {servicioSeleccionado && (
            <>
              {/* Separador visual y encabezado - No para Ampliación (tiene su propio encabezado) */}
              {!esAmpliacion && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.formHeader}>
                    <Text style={styles.formHeaderText}>Información del Solicitante</Text>
                  </View>
                </>
              )}
              {/* Tipo de Solicitante - Renovación, Cesión y Presentación de Oposición usan Natural/Jurídica directamente */}
              {(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion') ||
                nombreServicio.includes('cesión') || nombreServicio.includes('cesion') ||
                (nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta')) ? (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Tipo de Solicitante <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoPersona === 'Natural' && styles.radioButtonSelected]}
                      onPress={() => {
                        setTipoPersona('Natural');
                        setTipoSolicitante('Titular');
                      }}>
                      <Text style={[styles.radioText, tipoPersona === 'Natural' && styles.radioTextSelected]}>
                        Natural
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.radioButton, tipoPersona === 'Jurídica' && styles.radioButtonSelected]}
                      onPress={() => {
                        setTipoPersona('Jurídica');
                        setTipoSolicitante('Titular');
                      }}>
                      <Text style={[styles.radioText, tipoPersona === 'Jurídica' && styles.radioTextSelected]}>
                        Jurídica
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {/* Tipo de Solicitante (para otros servicios) */}
                  {!esBusquedaAntecedentes && 
                   !(nombreServicio.includes('respuesta') && nombreServicio.includes('oposición')) &&
                   !nombreServicio.includes('ampliación') && 
                   !nombreServicio.includes('ampliacion') && (
                    <View style={styles.section}>
                      <Text style={styles.label}>
                        Tipo de Solicitante <Text style={styles.required}>*</Text>
                      </Text>
                      <View style={styles.radioGroup}>
                        <TouchableOpacity
                          style={[styles.radioButton, tipoSolicitante === 'Titular' && styles.radioButtonSelected]}
                          onPress={() => setTipoSolicitante('Titular')}>
                          <Text style={[styles.radioText, tipoSolicitante === 'Titular' && styles.radioTextSelected]}>
                            Titular
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.radioButton, tipoSolicitante === 'Representante Autorizado' && styles.radioButtonSelected]}
                          onPress={() => setTipoSolicitante('Representante Autorizado')}>
                          <Text style={[styles.radioText, tipoSolicitante === 'Representante Autorizado' && styles.radioTextSelected]}>
                            Representante Autorizado
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Tipo de Persona */}
                  {!esBusquedaAntecedentes && 
                   tipoSolicitante === 'Titular' &&
                   !(nombreServicio.includes('respuesta') && nombreServicio.includes('oposición')) &&
                   !nombreServicio.includes('ampliación') && 
                   !nombreServicio.includes('ampliacion') && (
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
                </>
              )}

              {/* Campos de Persona Natural */}
              {(esBusquedaAntecedentes || 
                (nombreServicio.includes('renovación') || nombreServicio.includes('renovacion') ||
                 nombreServicio.includes('cesión') || nombreServicio.includes('cesion') ||
                 ((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta'))) ||
                (tipoPersona === 'Natural' && !nombreServicio.includes('respuesta') && !nombreServicio.includes('ampliación') && !nombreServicio.includes('ampliacion') && 
                 !(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) &&
                 !(nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) &&
                 !((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta'))) || 
                (tipoSolicitante === 'Representante Autorizado' && !nombreServicio.includes('respuesta') && !nombreServicio.includes('ampliación') && !nombreServicio.includes('ampliacion'))) && (
                <>
                  {(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion') ||
                    nombreServicio.includes('cesión') || nombreServicio.includes('cesion') ||
                    ((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta'))) && (
                    <View style={[styles.section, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>
                        {tipoPersona === 'Natural' ? 'Información del Solicitante' : 'Información del Contacto/Representante'}
                      </Text>
                    </View>
                  )}
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
                          <Text style={[styles.selectButtonText, tipoDocumento === tipo && styles.selectButtonTextSelected]}>
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
              {(() => {
                const esRenovacion = nombreServicio.includes('renovación') || nombreServicio.includes('renovacion');
                const esCesion = nombreServicio.includes('cesión') || nombreServicio.includes('cesion');
                const esOposicion = (nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta');
                
                if (esRenovacion || esCesion || esOposicion) {
                  return tipoPersona === 'Jurídica';
                }
                return !esBusquedaAntecedentes && 
                       tipoSolicitante === 'Titular' && 
                       tipoPersona === 'Jurídica' &&
                       !(nombreServicio.includes('respuesta') && nombreServicio.includes('oposición')) &&
                       !nombreServicio.includes('ampliación') && 
                       !nombreServicio.includes('ampliacion');
              })() && (
                <>
                  {(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion') ||
                    nombreServicio.includes('cesión') || nombreServicio.includes('cesion') ||
                    ((nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta'))) && (
                    <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>
                        Información de la Empresa
                      </Text>
                    </View>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Razón Social <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Razón social de la empresa"
                      value={nombreEmpresa}
                      onChangeText={setNombreEmpresa}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      NIT <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Sin guión ni dígito de verificación (ej: 9001234567)
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="9001234567"
                      value={nit}
                      onChangeText={setNit}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Tipo de Entidad <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="S.A.S, S.A., LTDA, etc."
                      value={tipoEntidad}
                      onChangeText={setTipoEntidad}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Representante Legal <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo del representante legal"
                      value={representanteLegal}
                      onChangeText={setRepresentanteLegal}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos comunes de contacto */}
              {!(nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion')) && (
                <>
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
                </>
              )}

              {/* Campos de marca */}
              {!(nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion')) &&
               !(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) &&
               !(nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) && (
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
              )}

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

              {/* Campos específicos para Renovación de Marca */}
              {(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) && (
                <>
                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Información de la Marca a Renovar</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombre de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la marca a renovar"
                      value={nombreMarca}
                      onChangeText={setNombreMarca}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Expediente de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 2020-123456"
                      value={numeroExpedienteMarca}
                      onChangeText={setNumeroExpedienteMarca}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>Clase Niza (Opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 25, 28, 35"
                      value={claseNiza}
                      onChangeText={setClaseNiza}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos específicos para Cesión de Marca */}
              {(nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) && (
                <>
                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Información de la Marca a Ceder</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombre de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la marca a ceder"
                      value={nombreMarca}
                      onChangeText={setNombreMarca}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Expediente de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 2019-789012"
                      value={numeroExpedienteMarca}
                      onChangeText={setNumeroExpedienteMarca}
                      editable={!loading}
                    />
                  </View>
                  
                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Datos del Cesionario</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombre o Razón Social del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre o razón social"
                      value={nombreRazonSocialCesionario}
                      onChangeText={setNombreRazonSocialCesionario}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      NIT del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="NIT (9-15 dígitos)"
                      value={nitCesionario}
                      onChangeText={setNitCesionario}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Representante Legal del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo"
                      value={representanteLegalCesionario}
                      onChangeText={setRepresentanteLegalCesionario}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Tipo de Documento del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.selectGroup}>
                      {['CC', 'CE', 'TI', 'PAS'].map((tipo) => (
                        <TouchableOpacity
                          key={tipo}
                          style={[styles.selectButton, tipoDocumentoCesionario === tipo && styles.selectButtonSelected]}
                          onPress={() => setTipoDocumentoCesionario(tipo)}>
                          <Text style={[styles.selectButtonText, tipoDocumentoCesionario === tipo && styles.selectButtonTextSelected]}>
                            {tipo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Documento del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Número de documento"
                      value={numeroDocumentoCesionario}
                      onChangeText={setNumeroDocumentoCesionario}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Correo del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="correo@ejemplo.com"
                      value={correoCesionario}
                      onChangeText={setCorreoCesionario}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Teléfono del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="3001234567"
                      value={telefonoCesionario}
                      onChangeText={setTelefonoCesionario}
                      keyboardType="phone-pad"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Dirección del Cesionario <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Dirección completa"
                      value={direccionCesionario}
                      onChangeText={setDireccionCesionario}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos específicos para Presentación de Oposición */}
              {(nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta') && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      NIT de la Empresa <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Requerido incluso para persona natural (requisito legal)
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="NIT (10 dígitos)"
                      value={nit}
                      onChangeText={setNit}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Marca a la que se Opone <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la marca a la que se opone"
                      value={marcaAOponerse}
                      onChangeText={setMarcaAOponerse}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Argumentos de Oposición <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Mínimo 10 caracteres
                    </Text>
                    <TextInput
                      style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                      placeholder="Describa los argumentos legales de la oposición..."
                      value={argumentosRespuesta}
                      onChangeText={setArgumentosRespuesta}
                      multiline
                      numberOfLines={4}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos específicos para Respuesta a Oposición */}
              {nombreServicio.includes('respuesta') && nombreServicio.includes('oposición') && (
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
                          <Text style={[styles.selectButtonText, tipoDocumento === tipo && styles.selectButtonTextSelected]}>
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

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Razón Social <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Siempre requerido para este servicio
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Razón social de la empresa"
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
                      placeholder="NIT (10 dígitos)"
                      value={nit}
                      onChangeText={setNit}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Representante Legal <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre completo del representante legal"
                      value={representanteLegal}
                      onChangeText={setRepresentanteLegal}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Expediente de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 2021-345678"
                      value={numeroExpedienteMarca}
                      onChangeText={setNumeroExpedienteMarca}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Marca Opositora <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la marca que presentó la oposición"
                      value={marcaOpositora}
                      onChangeText={setMarcaOpositora}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Campos específicos para Ampliación de Alcance */}
              {esAmpliacion && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.formHeader}>
                    <Text style={styles.formHeaderText}>Información del Solicitante</Text>
                  </View>
                  
                  <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Información del Titular</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Documento o NIT del Titular <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Documento o NIT (6-20 dígitos)"
                      value={documentoNitTitular}
                      onChangeText={setDocumentoNitTitular}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

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
                      Ciudad <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Bogotá"
                      value={ciudad}
                      onChangeText={setCiudad}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      País <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Colombia"
                      value={pais}
                      onChangeText={setPais}
                      editable={!loading}
                    />
                  </View>

                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Información de la Marca</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nombre de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la marca"
                      value={nombreMarca}
                      onChangeText={setNombreMarca}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Número de Registro Existente <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 2020-567890"
                      value={numeroRegistroExistente}
                      onChangeText={setNumeroRegistroExistente}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Clase Niza Actual <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 25"
                      value={claseNizaActual}
                      onChangeText={setClaseNizaActual}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Nuevas Clases Niza <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 28, 35"
                      value={nuevasClasesNiza}
                      onChangeText={setNuevasClasesNiza}
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Descripción de Nuevos Productos/Servicios <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Mínimo 10 caracteres
                    </Text>
                    <TextInput
                      style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                      placeholder="Describa los nuevos productos o servicios..."
                      value={descripcionNuevosProductosServicios}
                      onChangeText={setDescripcionNuevosProductosServicios}
                      multiline
                      numberOfLines={4}
                      editable={!loading}
                    />
                  </View>
                </>
              )}

              {/* Archivos - Específicos por servicio */}
              {esBusquedaAntecedentes && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Logotipo de la Marca <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity style={styles.fileButton} onPress={seleccionarImagen} disabled={loading}>
                    <Text style={styles.fileButtonText}>
                      {logotipoMarca ? '✓ Imagen seleccionada' : '📷 Seleccionar Imagen (JPG/PNG)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {(nombreServicio.includes('renovación') || nombreServicio.includes('renovacion')) && (
                <>
                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Documentos Requeridos</Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Todos los documentos son obligatorios. Tamaño máximo: 5MB por archivo.
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Certificado de Renovación <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('certificadoRenovacion', setCertificadoRenovacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {certificadoRenovacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Logotipo de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Solo JPG o PNG (NO PDF)
                    </Text>
                    <TouchableOpacity style={styles.fileButton} onPress={seleccionarImagen} disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {logotipoMarca ? '✓ Imagen seleccionada' : '📷 Seleccionar Imagen (JPG/PNG)'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Poder de Autorización <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {(nombreServicio.includes('cesión') || nombreServicio.includes('cesion')) && (
                <>
                  <View style={[styles.section, { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Documentos Requeridos</Text>
                    <Text style={[styles.label, { fontSize: 12, color: colors.gray, fontWeight: '400', marginTop: 4 }]}>
                      Todos los documentos son obligatorios. Tamaño máximo: 5MB por archivo.
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Documento de Cesión <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('documentoCesion', setDocumentoCesion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {documentoCesion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Poder de Autorización <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {(nombreServicio.includes('oposición') || nombreServicio.includes('oposicion')) && !nombreServicio.includes('respuesta') && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Documentos de Oposición <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('documentosOposicion', setDocumentosOposicion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {documentosOposicion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Poder de Autorización <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {nombreServicio.includes('respuesta') && nombreServicio.includes('oposición') && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Poder de Autorización <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                    disabled={loading}>
                    <Text style={styles.fileButtonText}>
                      {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {(nombreServicio.includes('ampliación') || nombreServicio.includes('ampliacion')) && (
                <View style={styles.section}>
                  <Text style={styles.label}>
                    Soportes <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => seleccionarDocumento('soportes', setSoportes)}
                    disabled={loading}>
                    <Text style={styles.fileButtonText}>
                      {soportes ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Archivos para Certificación y otros servicios */}
              {!esBusquedaAntecedentes && 
               !nombreServicio.includes('renovación') && 
               !nombreServicio.includes('renovacion') &&
               !nombreServicio.includes('cesión') && 
               !nombreServicio.includes('cesion') &&
               !nombreServicio.includes('oposición') && 
               !nombreServicio.includes('oposicion') &&
               !nombreServicio.includes('ampliación') && 
               !nombreServicio.includes('ampliacion') && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Logotipo de la Marca <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.fileButton} onPress={seleccionarImagen} disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {logotipoMarca ? '✓ Imagen seleccionada' : '📷 Seleccionar Imagen (JPG/PNG)'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>
                      Poder de Autorización <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.fileButton}
                      onPress={() => seleccionarDocumento('poderAutorizacion', setPoderAutorizacion)}
                      disabled={loading}>
                      <Text style={styles.fileButtonText}>
                        {poderAutorizacion ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
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
                          {certificadoCamara ? '✓ Documento seleccionado' : '📄 Seleccionar PDF/JPG/PNG'}
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

      {/* Modal de Pago */}
      {showPaymentModal && (
        <Modal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Procesar Pago">
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentLabel}>Monto a Pagar:</Text>
            <Text style={styles.paymentAmount}>
              {montoAPagar ? new Intl.NumberFormat('es-CO', { 
                style: 'currency', 
                currency: 'COP', 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(montoAPagar) : 'Calculando...'}
            </Text>
            <Text style={styles.paymentInfo}>
              Tu solicitud ha sido creada exitosamente. Para activarla, por favor procesa el pago.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, processingPayment && styles.buttonDisabled]}
              onPress={handleProcesarPago}
              disabled={processingPayment}>
              {processingPayment ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Procesando...</Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>Procesar Pago</Text>
              )}
            </TouchableOpacity>
          </View>
        </Modal>
      )}

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
    marginBottom: 24,
    gap: 10,
  },
  separator: {
    height: 2,
    backgroundColor: colors.border,
    marginTop: 50,
    marginBottom: 40,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  formHeader: {
    marginBottom: 32,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  required: {
    color: colors.danger,
  },
  serviciosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  servicioButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  servicioButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  servicioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  servicioButtonTextSelected: {
    color: '#FFFFFF',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  radioText: {
    fontSize: 15,
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
    padding: 14,
    fontSize: 15,
    color: colors.primaryDark,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    lineHeight: 20,
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  selectButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
  fileButton: {
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  fileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 130,
    minHeight: 48,
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
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentContainer: {
    padding: 20,
    gap: 20,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    marginVertical: 10,
  },
  paymentInfo: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 20,
  },
});


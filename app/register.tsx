import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/contexts/AuthContext';
import { authStyles, colors } from '@/styles/authStyles';
import { sanitizeRegisterData } from '@/utils/sanitizers';
import { getPasswordRequirementsShort, validateEmail, validatePasswordStrength } from '@/utils/validators';

interface RegisterForm {
  nombre: string;
  apellido: string;
  tipo_documento: string;
  documento: string;
  correo: string;
  telefono?: string;
  contrasena: string;
  confirmacion: string;
}

const initialState: RegisterForm = {
  nombre: '',
  apellido: '',
  tipo_documento: '',
  documento: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirmacion: '',
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterForm>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', success: false });

  const handleChange = (key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!form.tipo_documento.trim()) newErrors.tipo_documento = 'Selecciona un tipo de documento.';
    if (!form.documento.trim()) newErrors.documento = 'El número de documento es obligatorio.';
    if (!form.correo.trim()) newErrors.correo = 'El correo es obligatorio.';
    else if (!validateEmail(form.correo)) newErrors.correo = 'Correo inválido.';
    if (!form.contrasena.trim()) newErrors.contrasena = 'La contraseña es obligatoria.';
    else {
      const validation = validatePasswordStrength(form.contrasena);
      if (!validation.isValid) newErrors.contrasena = validation.errors.join(' ');
    }
    if (!form.confirmacion.trim()) newErrors.confirmacion = 'Confirma tu contraseña.';
    if (form.contrasena && form.confirmacion && form.contrasena !== form.confirmacion) {
      newErrors.confirmacion = 'Las contraseñas no coinciden.';
    }
    if (!acceptPolicy) newErrors.politica = 'Debes aceptar la política de privacidad.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setAlertConfig({
        visible: true,
        title: 'Campos incompletos',
        message: 'Por favor, completa todos los campos requeridos.',
        success: false,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = sanitizeRegisterData({
        ...form,
        telefono: form.telefono?.trim() || undefined,
        contrasena: form.contrasena,
        id_rol: 3,
      });
      await register(payload);
      setAlertConfig({
        visible: true,
        title: 'Registro exitoso',
        message: 'Revisa tu correo para confirmar la activación. Ahora puedes iniciar sesión.',
        success: true,
      });
      setForm(initialState);
      setAcceptPolicy(false);
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'No pudimos completar el registro',
        message: error instanceof Error ? error.message : 'Intenta nuevamente en unos minutos.',
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    if (alertConfig.success) {
      router.replace('/login');
    }
  };

  return (
    <View style={[authStyles.container, { padding: 0 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.card}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            <Text style={authStyles.title}>Crea tu cuenta</Text>
            <Text style={authStyles.subtitle}>Completa los siguientes datos</Text>

        <Text style={authStyles.inputLabel}>Nombre</Text>
        <TextInput
          style={[authStyles.input, errors.nombre && authStyles.inputError]}
          placeholder="Tu nombre"
          placeholderTextColor={colors.gray}
          value={form.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
        />
        {errors.nombre ? <Text style={authStyles.errorText}>{errors.nombre}</Text> : null}

        <Text style={authStyles.inputLabel}>Apellido</Text>
        <TextInput
          style={[authStyles.input, errors.apellido && authStyles.inputError]}
          placeholder="Tu apellido"
          placeholderTextColor={colors.gray}
          value={form.apellido}
          onChangeText={(text) => handleChange('apellido', text)}
        />
        {errors.apellido ? <Text style={authStyles.errorText}>{errors.apellido}</Text> : null}

        <Text style={authStyles.inputLabel}>Tipo de documento</Text>
        <TextInput
          style={[authStyles.input, errors.tipo_documento && authStyles.inputError]}
          placeholder="CC / CE / DNI"
          placeholderTextColor={colors.gray}
          value={form.tipo_documento}
          onChangeText={(text) => handleChange('tipo_documento', text.toUpperCase())}
        />
        {errors.tipo_documento ? <Text style={authStyles.errorText}>{errors.tipo_documento}</Text> : null}

        <Text style={authStyles.inputLabel}>Número de documento</Text>
        <TextInput
          style={[authStyles.input, errors.documento && authStyles.inputError]}
          placeholder="123456789"
          placeholderTextColor={colors.gray}
          keyboardType="number-pad"
          value={form.documento}
          onChangeText={(text) => handleChange('documento', text)}
        />
        {errors.documento ? <Text style={authStyles.errorText}>{errors.documento}</Text> : null}

        <Text style={authStyles.inputLabel}>Correo electrónico</Text>
        <TextInput
          style={[authStyles.input, errors.correo && authStyles.inputError]}
          placeholder="tu@correo.com"
          placeholderTextColor={colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.correo}
          onChangeText={(text) => handleChange('correo', text)}
        />
        {errors.correo ? <Text style={authStyles.errorText}>{errors.correo}</Text> : null}

        <Text style={authStyles.inputLabel}>Teléfono (opcional)</Text>
        <TextInput
          style={authStyles.input}
          placeholder="+57 300 000 0000"
          placeholderTextColor={colors.gray}
          keyboardType="phone-pad"
          value={form.telefono}
          onChangeText={(text) => handleChange('telefono', text)}
        />

        <Text style={authStyles.inputLabel}>Contraseña</Text>
        <TextInput
          style={[authStyles.input, errors.contrasena && authStyles.inputError]}
          placeholder="********"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={form.contrasena}
          onChangeText={(text) => handleChange('contrasena', text)}
        />
        <Text style={authStyles.helperText}>{getPasswordRequirementsShort()}</Text>
        {errors.contrasena ? <Text style={authStyles.errorText}>{errors.contrasena}</Text> : null}

        <Text style={authStyles.inputLabel}>Confirmar contraseña</Text>
        <TextInput
          style={[authStyles.input, errors.confirmacion && authStyles.inputError]}
          placeholder="********"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={form.confirmacion}
          onChangeText={(text) => handleChange('confirmacion', text)}
        />
        {errors.confirmacion ? <Text style={authStyles.errorText}>{errors.confirmacion}</Text> : null}

        <TouchableOpacity style={authStyles.checkboxRow} onPress={() => setAcceptPolicy((prev) => !prev)}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: acceptPolicy ? colors.accent : colors.border,
              backgroundColor: acceptPolicy ? colors.accent : '#fff',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {acceptPolicy ? <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text> : null}
          </View>
          <Text style={{ flex: 1, color: colors.gray }}>
            Acepto la política de privacidad y el tratamiento de datos personales.
          </Text>
        </TouchableOpacity>
        {errors.politica ? <Text style={authStyles.errorText}>{errors.politica}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, loading && { opacity: 0.8 }]}
          disabled={loading}
          onPress={handleRegister}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Crear cuenta</Text>}
        </TouchableOpacity>

          <View style={authStyles.row}>
            <Text style={{ color: colors.gray }}>¿Ya tienes cuenta?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={authStyles.link}>Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.success ? 'success' : 'error'}
        onConfirm={closeAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
    resizeMode: 'contain',
  },
});


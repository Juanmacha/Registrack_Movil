import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import CustomAlert from '@/components/CustomAlert';

import { useAuth } from '@/contexts/AuthContext';
import { authStyles, colors } from '@/styles/authStyles';
import { ApiClientError } from '@/utils/apiError';
import { sanitizeLoginData } from '@/utils/sanitizers';
import { tieneRolAdministrativo } from '@/utils/roles';
import { validateEmail } from '@/utils/validators';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.correo.trim()) {
      newErrors.correo = 'El correo es requerido.';
    } else if (!validateEmail(form.correo)) {
      newErrors.correo = 'Ingresa un correo válido.';
    }

    if (!form.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const sanitized = sanitizeLoginData(form);
      const usuario = await login(sanitized);
      
      // DEBUG: Log para ver qué se recibe
      console.log('🔍 DEBUG LOGIN - Usuario recibido:', JSON.stringify(usuario, null, 2));
      console.log('🔍 DEBUG LOGIN - Roles:', usuario.roles);
      console.log('🔍 DEBUG LOGIN - Tipo de roles:', typeof usuario.roles);
      console.log('🔍 DEBUG LOGIN - Es array?', Array.isArray(usuario.roles));
      console.log('🔍 DEBUG LOGIN - Es administrativo?', tieneRolAdministrativo(usuario));
      
      const destination = tieneRolAdministrativo(usuario) ? '/dashboard' : '/(tabs)/explore';
      console.log('🔍 DEBUG LOGIN - Destino:', destination);
      router.replace(destination);
    } catch (error) {
      let title = 'No pudimos iniciar sesión';
      let message = 'Revisa tus credenciales e inténtalo de nuevo.';
      
      if (error instanceof Error) {
        message = error.message;
        // Si es un error 429 (rate limit), cambiar el título
        const apiError = error as ApiClientError;
        if (apiError.status === 429) {
          title = 'Demasiados intentos';
        }
      }
      
      setAlertConfig({
        visible: true,
        title,
        message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Bienvenido a Registrack</Text>
        <Text style={authStyles.subtitle}>Ingresa tus credenciales para continuar</Text>

        <Text style={authStyles.inputLabel}>Correo electrónico</Text>
        <TextInput
          placeholder="tu@correo.com"
          placeholderTextColor={colors.gray}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[authStyles.input, errors.correo && authStyles.inputError]}
          value={form.correo}
          onChangeText={(text) => handleChange('correo', text)}
        />
        {errors.correo ? <Text style={authStyles.errorText}>{errors.correo}</Text> : null}

        <Text style={authStyles.inputLabel}>Contraseña</Text>
        <View>
          <TextInput
            placeholder="********"
            placeholderTextColor={colors.gray}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            style={[authStyles.input, errors.contrasena && authStyles.inputError]}
            value={form.contrasena}
            onChangeText={(text) => handleChange('contrasena', text)}
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={{ position: 'absolute', right: 12, top: 12 }}
            onPress={() => setShowPassword((prev) => !prev)}>
            <Text style={authStyles.link}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        </View>
        {errors.contrasena ? <Text style={authStyles.errorText}>{errors.contrasena}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, loading && { opacity: 0.8 }]}
          disabled={loading}
          onPress={handleLogin}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Ingresar</Text>}
        </TouchableOpacity>

        <View style={authStyles.row}>
          <Text style={{ color: colors.gray }}>¿Olvidaste tu contraseña?</Text>
          <Link href="/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={authStyles.link}>Recupérala</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={authStyles.row}>
          <Text style={{ color: colors.gray }}>¿Aún no tienes cuenta?</Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={authStyles.link}>Regístrate</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type === 'error' ? 'error' : 'info'}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}


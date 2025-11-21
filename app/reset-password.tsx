import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import CustomAlert from '@/components/CustomAlert';
import { authApiService } from '@/services/authApiService';
import { authStyles, colors } from '@/styles/authStyles';
import { recoveryStorage } from '@/storage/recoveryStorage';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';
import { getPasswordRequirementsShort, validatePasswordStrength } from '@/utils/validators';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', success: false });

  useEffect(() => {
    const fetchContext = async () => {
      const storedToken = await recoveryStorage.getToken();
      if (!storedToken) {
        router.replace('/forgot-password');
        return;
      }
      setToken(storedToken);
    };
    void fetchContext();
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!password.trim()) {
      newErrors.password = 'Ingresa una nueva contraseña.';
    } else {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        newErrors.password = validation.errors.join(' ');
      }
    }

    if (!confirm.trim()) {
      newErrors.confirm = 'Confirma la nueva contraseña.';
    } else if (password !== confirm) {
      newErrors.confirm = 'Las contraseñas deben coincidir.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !token) {
      return;
    }

    setLoading(true);
    try {
      await authApiService.resetPassword({ token, newPassword: password });
      await recoveryStorage.clear();
      setAlertConfig({
        visible: true,
        title: 'Contraseña actualizada',
        message: 'Tu contraseña fue restablecida. Inicia sesión con tus nuevos datos.',
        success: true,
      });
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: 'No pudimos actualizar tu contraseña',
        message: obtenerMensajeErrorUsuario(err as Error),
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    if (alertConfig.success) {
      router.replace('/login');
    }
  };

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Crea una nueva contraseña</Text>
        <Text style={authStyles.subtitle}>Evita contraseñas usadas anteriormente para proteger tu cuenta.</Text>

        <Text style={authStyles.inputLabel}>Nueva contraseña</Text>
        <TextInput
          style={[authStyles.input, errors.password && authStyles.inputError]}
          placeholder="********"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: '' }));
          }}
        />
        <Text style={authStyles.helperText}>{getPasswordRequirementsShort()}</Text>
        {errors.password ? <Text style={authStyles.errorText}>{errors.password}</Text> : null}

        <Text style={authStyles.inputLabel}>Confirmar contraseña</Text>
        <TextInput
          style={[authStyles.input, errors.confirm && authStyles.inputError]}
          placeholder="********"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setErrors((prev) => ({ ...prev, confirm: '' }));
          }}
        />
        {errors.confirm ? <Text style={authStyles.errorText}>{errors.confirm}</Text> : null}

        <TouchableOpacity style={[authStyles.button, loading && { opacity: 0.8 }]} disabled={loading} onPress={handleSubmit}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Actualizar contraseña</Text>}
        </TouchableOpacity>

        <View style={authStyles.row}>
          <Text style={{ color: colors.gray }}>¿Ya recuerdas tu contraseña?</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={authStyles.link}>Volver al login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.success ? 'success' : 'error'}
        onConfirm={handleAlertClose}
      />
    </View>
  );
}


import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import CustomAlert from '@/components/CustomAlert';
import { authApiService } from '@/services/authApiService';
import { authStyles, colors } from '@/styles/authStyles';
import { recoveryStorage } from '@/storage/recoveryStorage';
import { sanitizeEmail } from '@/utils/sanitizers';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';
import { validateEmail } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', success: false });

  const handleSubmit = async () => {
    if (!correo.trim()) {
      setError('Ingresa tu correo.');
      return;
    }
    if (!validateEmail(correo)) {
      setError('El correo no es válido.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const email = sanitizeEmail(correo);
      await authApiService.forgotPassword({ correo: email });
      await recoveryStorage.setEmail(email);
      setAlertConfig({
        visible: true,
        title: 'Código enviado',
        message: 'Revisa tu bandeja de entrada e ingresa el código que recibiste.',
        success: true,
      });
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: 'No pudimos enviar el código',
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
      router.push('/codigo-recuperacion');
    }
  };

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Recupera tu acceso</Text>
        <Text style={authStyles.subtitle}>
          Ingresa el correo con el que te registraste y te enviaremos un código de verificación.
        </Text>

        <Text style={authStyles.inputLabel}>Correo registrado</Text>
        <TextInput
          style={[authStyles.input, error && authStyles.inputError]}
          placeholder="tu@correo.com"
          placeholderTextColor={colors.gray}
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={(text) => {
            setCorreo(text);
            setError('');
          }}
        />
        {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[authStyles.button, loading && { opacity: 0.8 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Enviar código</Text>}
        </TouchableOpacity>

        <View style={authStyles.row}>
          <Text style={{ color: colors.gray }}>¿Recordaste tus datos?</Text>
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


import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import CustomAlert from '@/components/CustomAlert';
import { authApiService } from '@/services/authApiService';
import { authStyles, colors } from '@/styles/authStyles';
import { recoveryStorage } from '@/storage/recoveryStorage';
import { obtenerMensajeErrorUsuario } from '@/utils/apiError';
import { isNumericCode } from '@/utils/validators';

export default function CodigoRecuperacionScreen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [correo, setCorreo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', success: false });

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await recoveryStorage.getEmail();
      if (!storedEmail) {
        router.replace('/forgot-password');
        return;
      }
      setCorreo(storedEmail);
    };
    void fetchEmail();
  }, [router]);

  const handleSubmit = async () => {
    if (!codigo.trim()) {
      setError('Ingresa el código que recibiste.');
      return;
    }

    if (!isNumericCode(codigo)) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    if (!correo) {
      setAlertConfig({
        visible: true,
        title: 'Sesión expirada',
        message: 'Vuelve a solicitar el código para continuar.',
        success: false,
      });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authApiService.verifyResetCode({ correo, codigo });
      await recoveryStorage.setToken(response.token);
      setAlertConfig({
        visible: true,
        title: 'Código verificado',
        message: 'Ahora crea una nueva contraseña segura.',
        success: true,
      });
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: 'Código inválido',
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
      router.push('/reset-password');
    }
  };

  return (
    <View style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>Ingresa tu código</Text>
        <Text style={authStyles.subtitle}>
          {correo ? `Hemos enviado un código a ${correo}` : 'Recuperando información...'}
        </Text>

        <Text style={authStyles.inputLabel}>Código de 6 dígitos</Text>
        <TextInput
          style={[authStyles.input, error && authStyles.inputError]}
          placeholder="000000"
          placeholderTextColor={colors.gray}
          keyboardType="number-pad"
          maxLength={6}
          value={codigo}
          onChangeText={(text) => {
            setCodigo(text.replace(/[^\d]/g, ''));
            setError('');
          }}
        />
        {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[authStyles.button, loading && { opacity: 0.8 }]} disabled={loading} onPress={handleSubmit}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>Validar código</Text>}
        </TouchableOpacity>

        <View style={authStyles.row}>
          <Text style={{ color: colors.gray }}>¿No recibiste el correo?</Text>
          <Link href="/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={authStyles.link}>Reenviar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.success ? 'success' : 'error'}
        confirmText="Continuar"
        onConfirm={handleAlertClose}
      />
    </View>
  );
}


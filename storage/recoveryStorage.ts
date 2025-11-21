import AsyncStorage from '@react-native-async-storage/async-storage';

const RECOVERY_KEYS = {
  email: 'emailRecuperacion',
  token: 'resetToken',
};

export const recoveryStorage = {
  async setEmail(correo: string) {
    await AsyncStorage.setItem(RECOVERY_KEYS.email, correo);
  },
  async getEmail() {
    return AsyncStorage.getItem(RECOVERY_KEYS.email);
  },
  async setToken(token: string) {
    await AsyncStorage.setItem(RECOVERY_KEYS.token, token);
  },
  async getToken() {
    return AsyncStorage.getItem(RECOVERY_KEYS.token);
  },
  async clear() {
    await AsyncStorage.multiRemove(Object.values(RECOVERY_KEYS));
  },
};


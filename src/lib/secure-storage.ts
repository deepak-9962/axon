import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';

export const saveApiKey = async (key: string) => {
  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.set({ key: 'GEMINI_API_KEY', value: key });
  } else {
    localStorage.setItem('GEMINI_API_KEY', key);
  }
};

export const getApiKey = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await SecureStoragePlugin.get({ key: 'GEMINI_API_KEY' });
      return value;
    } else {
      return localStorage.getItem('GEMINI_API_KEY');
    }
  } catch (e) {
    console.warn('Error fetching API key or key not found:', e);
    return null;
  }
};

export const saveModelName = async (model: string) => {
  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.set({ key: 'GEMINI_MODEL_NAME', value: model });
  } else {
    localStorage.setItem('GEMINI_MODEL_NAME', model);
  }
};

export const getModelName = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await SecureStoragePlugin.get({ key: 'GEMINI_MODEL_NAME' });
      return value;
    } else {
      return localStorage.getItem('GEMINI_MODEL_NAME') || 'gemini-1.5-flash';
    }
  } catch (e) {
    return 'gemini-1.5-flash'; // Default fallback
  }
};

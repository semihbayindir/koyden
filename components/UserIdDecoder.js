import { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob } from 'base-64';

export function useUserIdDecoder() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const base64UrlDecode = (input) => {
      const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded);
    };

    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token !== null) {
          const [header, payload, signature] = token.split('.');
          const decodedPayload = base64UrlDecode(payload);
          setUserId(decodedPayload.userId);
        }
      } catch (error) {
        console.error('Token alınamadı veya decode edilemedi:', error);
      }
    };

    fetchUserId();
  }, []);

  return userId;
}

// This file is no longer used - Supabase has been removed from the project
// Authentication is now handled via Firebase in providers/auth-provider.jsx
// If you need to restore Supabase, uncomment the code below and install dependencies:
// npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

/*
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const ExpoWebSecureStoreAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      storage: ExpoWebSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
*/

// Export a mock object to prevent import errors (if any files still try to import)
export const supabase = null;

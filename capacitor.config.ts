import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nomadller.travelagency',
  appName: 'Nomadller Solutions',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true
  }
};

export default config;

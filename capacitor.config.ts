import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ziraeduconnect.app',
  appName: 'Zira Edu Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      autoHide: true,
      androidScaleType: 'center',
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashImmersive: true,
    },
  },
};

export default config;

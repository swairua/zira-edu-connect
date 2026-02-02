import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration with Dynamic Android Auth URL Support
 *
 * The setup-android-auth.js script will inject:
 * - authUrl: Authentication endpoint URL
 * - url: Server URL for Capacitor to proxy requests
 */

// Get auth URL from environment variables (set by setup-android-auth.js)
const authUrl = process.env.VITE_AUTH_URL || 'https://ziraedx.com/auth';
const capacitorUrl = process.env.VITE_CAPACITOR_URL || 'https://ziraedx.com';

const config: CapacitorConfig = {
  appId: 'com.ziraeduconnect.app',
  appName: 'Zira Edu Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: capacitorUrl,
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

/**
 * Auth Configuration Service
 * 
 * Provides flexible, runtime-accessible authentication URL configuration
 * with support for multiple sources and fallbacks:
 * 
 * Priority Order:
 * 1. localStorage override (admin/user configured)
 * 2. window.CONFIG.authUrl (injected at runtime)
 * 3. import.meta.env.VITE_AUTH_URL (from build environment)
 * 4. Capacitor config
 * 5. Default fallback
 */

const DEFAULT_AUTH_URL = 'https://ziraedx.com/auth';
const STORAGE_KEY = 'auth_config_override';

interface AuthConfig {
  authUrl: string;
  appMode: string;
  isAndroid: boolean;
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get auth URL with fallback chain
 */
export function getAuthUrl(): string {
  // 1. Check localStorage override first (highest priority)
  try {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override) {
      const parsed = JSON.parse(override);
      if (parsed.authUrl && isValidUrl(parsed.authUrl)) {
        console.log('[AuthConfig] Using localStorage override:', parsed.authUrl);
        return parsed.authUrl;
      }
    }
  } catch (e) {
    console.warn('[AuthConfig] Error reading localStorage override:', e);
  }

  // 2. Check window.CONFIG (injected at runtime)
  if (typeof window !== 'undefined' && (window as any).CONFIG?.authUrl) {
    const url = (window as any).CONFIG.authUrl;
    if (isValidUrl(url)) {
      console.log('[AuthConfig] Using window.CONFIG.authUrl:', url);
      return url;
    }
  }

  // 3. Check environment variable from build
  if (import.meta.env.VITE_AUTH_URL && isValidUrl(import.meta.env.VITE_AUTH_URL)) {
    console.log('[AuthConfig] Using VITE_AUTH_URL:', import.meta.env.VITE_AUTH_URL);
    return import.meta.env.VITE_AUTH_URL;
  }

  // 4. Default fallback
  console.log('[AuthConfig] Using default auth URL:', DEFAULT_AUTH_URL);
  return DEFAULT_AUTH_URL;
}

/**
 * Get current app mode
 */
export function getAppMode(): string {
  return import.meta.env.VITE_APP_MODE || 'web';
}

/**
 * Check if running on Android
 */
export function isAndroidBuild(): boolean {
  // Check environment variable first
  if (import.meta.env.VITE_ANDROID_BUILD === 'true') {
    return true;
  }

  // Check Capacitor platform if available
  if (typeof window !== 'undefined') {
    const Capacitor = (window as any).Capacitor;
    if (Capacitor && typeof Capacitor.getPlatform === 'function') {
      return Capacitor.getPlatform() === 'android';
    }
  }

  return false;
}

/**
 * Get complete auth configuration
 */
export function getAuthConfig(): AuthConfig {
  return {
    authUrl: getAuthUrl(),
    appMode: getAppMode(),
    isAndroid: isAndroidBuild(),
  };
}

/**
 * Override auth URL at runtime (for admin/testing)
 * Persists to localStorage
 */
export function setAuthUrlOverride(url: string): boolean {
  if (!isValidUrl(url)) {
    console.error('[AuthConfig] Invalid URL format:', url);
    return false;
  }

  try {
    const override = {
      authUrl: url,
      setAt: new Date().toISOString(),
      source: 'admin-override',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(override));
    console.log('[AuthConfig] Auth URL override set to:', url);
    return true;
  } catch (e) {
    console.error('[AuthConfig] Error setting auth URL override:', e);
    return false;
  }
}

/**
 * Clear auth URL override
 */
export function clearAuthUrlOverride(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[AuthConfig] Auth URL override cleared');
  } catch (e) {
    console.error('[AuthConfig] Error clearing auth URL override:', e);
  }
}

/**
 * Get current override (if any)
 */
export function getAuthUrlOverride(): string | null {
  try {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override) {
      const parsed = JSON.parse(override);
      return parsed.authUrl || null;
    }
  } catch (e) {
    console.warn('[AuthConfig] Error reading auth URL override:', e);
  }
  return null;
}

/**
 * Initialize auth config on app startup
 * This should be called in App.tsx or main entry point
 */
export function initializeAuthConfig(): void {
  const config = getAuthConfig();
  
  console.log('[AuthConfig] Initialized with config:', {
    authUrl: config.authUrl,
    appMode: config.appMode,
    isAndroid: config.isAndroid,
  });

  // Expose config to window for debugging/runtime access
  if (typeof window !== 'undefined') {
    (window as any).__AUTH_CONFIG__ = config;
  }
}

/**
 * Get auth endpoint URL
 * Useful for constructing full URLs to auth endpoints
 */
export function getAuthEndpoint(endpoint: string): string {
  const baseUrl = getAuthUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

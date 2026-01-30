#!/usr/bin/env node

/**
 * Android Auth Setup Helper Script
 *
 * Configures authentication URLs for Android builds
 * Usage: node scripts/setup-android-auth.js [environment]
 *
 * Examples:
 *   npm run setup-android:prod
 *   npm run setup-android:dev
 *   npm run setup-android:staging
 *
 * Typical Workflow:
 *   1. First time setup:  npm run init-android
 *   2. Build web app:     npm run build:android
 *   3. Open in Studio:    npm run open:android
 *   4. Build & run APK in Android Studio
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Configuration for different environments
const environmentConfigs = {
  prod: {
    authUrl: 'https://ziraedx.com/auth',
    appMode: 'android-production',
    envFile: '.env.production.android',
    capacitorUrl: 'https://ziraedx.com',
  },
  staging: {
    authUrl: 'https://staging-ziraedx.com/auth',
    appMode: 'android-staging',
    envFile: '.env.staging.android',
    capacitorUrl: 'https://staging-ziraedx.com',
  },
  dev: {
    authUrl: 'https://localhost:8080/auth',
    appMode: 'android-development',
    envFile: '.env.development.android',
    capacitorUrl: 'https://localhost:8080',
  },
};

/**
 * Parse command line arguments
 */
function getEnvironment() {
  const env = process.argv[2] || 'dev';
  if (!environmentConfigs[env]) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error(`Available: ${Object.keys(environmentConfigs).join(', ')}`);
    process.exit(1);
  }
  return env;
}

/**
 * Validate URL format
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Read environment file if it exists
 */
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const config = {};

  content.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;

    const [key, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();

    // Remove quotes if present
    config[key.trim()] = value.replace(/^["']|["']$/g, '');
  });

  return config;
}

/**
 * Update Capacitor config with auth URL
 */
function updateCapacitorConfig(authUrl, capacitorUrl) {
  const configPath = path.join(rootDir, 'capacitor.config.ts');
  let content = fs.readFileSync(configPath, 'utf-8');

  // Check if server config with url already exists
  if (content.includes('server: {')) {
    // Replace the server config section
    const serverRegex = /server:\s*\{[^}]*\}/s;
    const newServerConfig = `server: {
    androidScheme: 'https',
    url: '${capacitorUrl}',
  }`;
    content = content.replace(serverRegex, newServerConfig);
  } else {
    // Add server config if it doesn't exist
    const configRegex = /const config: CapacitorConfig = \{/;
    content = content.replace(configRegex, `const config: CapacitorConfig = {
  authUrl: '${authUrl}',`);
  }

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log(`✅ Updated capacitor.config.ts with auth URL`);
}

/**
 * Create or update .env.local with Android-specific settings
 */
function createEnvLocal(config) {
  const envLocalPath = path.join(rootDir, '.env.local');
  const timestamp = new Date().toISOString();

  const envContent = `# Auto-generated Android build environment
# Generated: ${timestamp}
# Environment: ${config.appMode}

VITE_AUTH_URL=${config.authUrl}
VITE_APP_MODE=${config.appMode}
VITE_ANDROID_BUILD=true

# Capacitor configuration
VITE_CAPACITOR_URL=${config.capacitorUrl}
`;

  fs.writeFileSync(envLocalPath, envContent, 'utf-8');
  console.log(`✅ Created .env.local with Android-specific settings`);
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  const errors = [];

  if (!config.authUrl) {
    errors.push('Missing VITE_AUTH_URL');
  } else if (!validateUrl(config.authUrl)) {
    errors.push(`Invalid URL format for authUrl: ${config.authUrl}`);
  }

  if (!config.capacitorUrl) {
    errors.push('Missing capacitorUrl');
  } else if (!validateUrl(config.capacitorUrl)) {
    errors.push(`Invalid URL format for capacitorUrl: ${config.capacitorUrl}`);
  }

  if (!config.appMode) {
    errors.push('Missing appMode');
  }

  return errors;
}

/**
 * Print configuration summary
 */
function printSummary(environment, config) {
  console.log('\n' + '='.repeat(60));
  console.log('Android Auth Configuration Summary');
  console.log('='.repeat(60));
  console.log(`Environment: ${environment.toUpperCase()}`);
  console.log(`Auth URL: ${config.authUrl}`);
  console.log(`App Mode: ${config.appMode}`);
  console.log(`Capacitor URL: ${config.capacitorUrl}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    const environment = getEnvironment();
    const config = environmentConfigs[environment];

    console.log(`\n🔧 Setting up Android authentication for ${environment} environment...\n`);

    // Validate configuration
    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.error('❌ Configuration validation failed:');
      errors.forEach((error) => console.error(`  - ${error}`));
      process.exit(1);
    }

    // Update Capacitor config
    updateCapacitorConfig(config.authUrl, config.capacitorUrl);

    // Create .env.local
    createEnvLocal(config);

    // Print summary
    printSummary(environment, config);

    console.log('✅ Android authentication setup completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run build:android   (builds web app & syncs to Android)');
    console.log('  2. Run: npm run open:android    (opens Android Studio)');
    console.log('  3. Build & run APK in Android Studio\n');
    console.log('Or for first-time setup:');
    console.log('  npm run init-android            (one-time initialization)\n');
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    process.exit(1);
  }
}

main();

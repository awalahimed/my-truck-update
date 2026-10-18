import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SecureStore } from '../utils/storage';

export const PRODUCTION_URL = 'https://mytrucket.com';
export const RENDER_URL = 'https://my-track-pi3n.onrender.com';
export const DEV_TUNNEL_URL = 'https://gloves-cancer-linux-watched.trycloudflare.com';
export const DEFAULT_LOCAL_IP = '192.168.0.236';
export const WINDOWS_HOTSPOT_IP = '192.168.137.1';
export const DEFAULT_PORT = '3002';

export interface ServerPreset {
  id: string;
  label: string;
  url: string;
  description: string;
}

export const SERVER_PRESETS: ServerPreset[] = [
  {
    id: 'production',
    label: 'Production (Live Cloud)',
    url: PRODUCTION_URL,
    description: 'Live cloud backend (verified 24/7 on any network)',
  },
  {
    id: 'dev_tunnel',
    label: 'Local Laptop (HTTPS Tunnel)',
    url: DEV_TUNNEL_URL,
    description: 'Instant connection to your local backend, works on any Wi-Fi or 4G/5G',
  },
  {
    id: 'local_hotspot',
    label: 'Local Laptop (Windows Hotspot)',
    url: `http://${WINDOWS_HOTSPOT_IP}:${DEFAULT_PORT}`,
    description: 'Turn on Windows Mobile Hotspot and connect phone to laptop',
  },
  {
    id: 'local_wifi',
    label: 'Local Laptop (Wi-Fi LAN)',
    url: `http://${DEFAULT_LOCAL_IP}:${DEFAULT_PORT}`,
    description: 'Direct LAN connection (requires laptop and phone on same non-isolated Wi-Fi)',
  },
  {
    id: 'render',
    label: 'Render Staging (Cloud)',
    url: RENDER_URL,
    description: 'Cloud backup server on Render',
  },
];

function getInitialDefaultUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // In release builds, default to reliable production cloud
  if (!__DEV__) {
    return PRODUCTION_URL;
  }
  // In development mode, check hostUri or fallback to local IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:${DEFAULT_PORT}`;
  }
  return `http://${DEFAULT_LOCAL_IP}:${DEFAULT_PORT}`;
}

let activeBaseUrl = getInitialDefaultUrl();
const listeners = new Set<(url: string) => void>();

// Asynchronously load custom URL from storage
SecureStore.getItemAsync('custom_server_url')
  .then((saved) => {
    if (saved && saved.startsWith('http')) {
      activeBaseUrl = saved.trim().replace(/\/+$/, '');
      console.log('🌐 [Config] Loaded custom server URL from storage:', activeBaseUrl);
      listeners.forEach((fn) => fn(activeBaseUrl));
    }
  })
  .catch(() => {});

export function getActiveServerUrl(): string {
  return activeBaseUrl;
}

export async function setActiveServerUrl(newUrl: string): Promise<void> {
  const clean = newUrl.trim().replace(/\/+$/, '');
  activeBaseUrl = clean;
  await SecureStore.setItemAsync('custom_server_url', clean);
  console.log('🌐 [Config] Active server URL updated to:', clean);
  listeners.forEach((fn) => fn(clean));
}

export async function resetServerUrlToDefault(): Promise<void> {
  await SecureStore.deleteItemAsync('custom_server_url');
  activeBaseUrl = getInitialDefaultUrl();
  listeners.forEach((fn) => fn(activeBaseUrl));
}

export function subscribeServerUrlChange(listener: (url: string) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Test connectivity to any server URL with a 6-second timeout
 */
export async function testServerConnection(targetUrl: string): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
}> {
  const cleanUrl = targetUrl.trim().replace(/\/+$/, '');
  const testEndpoint = `${cleanUrl}/health`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(testEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      return {
        success: true,
        latencyMs,
        message: `Connected successfully! (${res.status} OK - ${latencyMs}ms)`,
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: `Server returned status ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return {
        success: false,
        latencyMs,
        message: 'Connection timed out (6s). Device cannot reach IP/Host.',
      };
    }
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Network request failed (unreachable)',
    };
  }
}

export const config = {
  api: {
    get baseUrl() {
      return activeBaseUrl;
    },
    get orpcUrl() {
      return `${activeBaseUrl}/rpc`;
    },
    get authUrl() {
      return `${activeBaseUrl}/api/auth`;
    },
    get wsUrl() {
      return activeBaseUrl.startsWith('https://')
        ? activeBaseUrl.replace('https://', 'wss://')
        : activeBaseUrl.replace('http://', 'ws://');
    },
    get uploadsUrl() {
      return `${activeBaseUrl}/uploads`;
    },
  },
};

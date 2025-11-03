/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

// Get API base URL from environment with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get backend base URL (without /api) for WebSocket connections
export const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Get WebSocket URL (converts http to ws, https to wss)
export const WS_BASE_URL = BACKEND_URL.replace(/^http/, 'ws');

// Logging for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  API_BASE_URL:', API_BASE_URL);
  console.log('  BACKEND_URL:', BACKEND_URL);
  console.log('  WS_BASE_URL:', WS_BASE_URL);
  console.log('  Environment:', import.meta.env.MODE);
}

/**
 * Helper function to build API endpoint URLs
 */
export const buildApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Helper function to build WebSocket URLs
 */
export const buildWsUrl = (path: string, token?: string): string => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const url = `${WS_BASE_URL}/${cleanPath}`;
  return token ? `${url}?token=${token}` : url;
};

export default {
  API_BASE_URL,
  BACKEND_URL,
  WS_BASE_URL,
  buildApiUrl,
  buildWsUrl
};

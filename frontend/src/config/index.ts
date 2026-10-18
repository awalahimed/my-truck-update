// Development vs Production URL configuration
const isDevelopment = import.meta.env.MODE === 'development' && window.location.hostname === 'localhost'

// In development, use separate backend URL
// In production, use same domain (served together)
const BASE_URL = isDevelopment ? 'http://localhost:3002' : window.location.origin;

export const URL = {
    BASE: BASE_URL,
    ORPC: `${BASE_URL}/rpc`,
    BETTER_AUTH: `${BASE_URL}/api/auth`,
    IMAGE: BASE_URL,
    WEBSOCKET: BASE_URL
}

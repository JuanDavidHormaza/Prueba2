// Configuracion de la aplicacion
export const config = {
  // URL base del API backend
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Tiempo de expiracion del token en minutos
  tokenExpirationMinutes: 60,
  
  // Modo de desarrollo - habilita fallbacks locales
  isDevelopment: import.meta.env.DEV,
};

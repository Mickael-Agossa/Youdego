import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  
  // ✅ Augmenter les limites de taille
  maxContentLength: 200 * 1024 * 1024, // 200 MB
  maxBodyLength: 200 * 1024 * 1024,    // 200 MB

  // ✅ Désactiver le timeout
  timeout: 0,
});

// Intercepteur pour déterminer dynamiquement le Content-Type
apiClient.interceptors.request.use(config => {
  // Si les données sont une instance FormData
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else if (config.data) {
    // Pour tous les autres cas (y compris les objets JSON)
    config.headers['Content-Type'] = 'application/json';
  }
  
  // Ajoutez ici votre logique d'authentification si nécessaire
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  
  return config;
});

export default apiClient;
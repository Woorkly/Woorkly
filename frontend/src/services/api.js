import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true,
})

const MUTATION_METHODS = ['post', 'put', 'patch', 'delete']

let csrfToken = null

const fetchCsrfToken = async () => {
  // On utilise l'instance API (baseURL = VITE_API_BASE) pour éviter le double /api
  // Ex: VITE_API_BASE = "http://localhost:3000/api" → GET http://localhost:3000/api/csrf-token ✓
  const res = await API.get('/csrf-token')
  csrfToken = res.data.csrfToken
  return csrfToken
}

API.interceptors.request.use(async (config) => {
  if (MUTATION_METHODS.includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

// Si le serveur renvoie 403 (token CSRF expiré), on renouvelle et on rejoue la requête
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 403 && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true
      csrfToken = null
      await fetchCsrfToken()
      originalRequest.headers['x-csrf-token'] = csrfToken
      return API(originalRequest)
    }
    return Promise.reject(error)
  }
)

export default API

import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true,
})

const MUTATION_METHODS = ['post', 'put', 'patch', 'delete']

let csrfToken = null

// Générer ou récupérer un UUID stable pour la session (utilisé pour le CSRF)
const getSessionId = () => {
  const key = '__session_id__'
  let sessionId = sessionStorage.getItem(key)

  if (!sessionId) {
    // Génère un UUID v4 si disponible (navigateurs modernes)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID()
    } else {
      // Fallback pour navigateurs anciens
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    sessionStorage.setItem(key, sessionId)
  }

  return sessionId
}

const fetchCsrfToken = async () => {
  // On utilise l'instance API (baseURL = VITE_API_BASE) pour éviter le double /api
  // Ex: VITE_API_BASE = "http://localhost:3000/api" → GET http://localhost:3000/api/csrf-token ✓
  const res = await API.get('/csrf-token')
  csrfToken = res.data.csrfToken
  return csrfToken
}

API.interceptors.request.use(async (config) => {
  // Envoyer le sessionId pour les non-authentifiés (utilisé pour identifier la session CSRF)
  config.headers['x-session-id'] = getSessionId()

  if (MUTATION_METHODS.includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

// Si le serveur renvoie 403 (token CSRF expiré), on renouvelle et on rejoue la requête
// Si le serveur renvoie 429 (rate limit), on notifie le frontend via un custom event
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 429) {
      const data = error.response.data || {}
      let msg = data.message || 'Trop de requêtes détectées. Veuillez réessayer bientôt.'

      // Améliorer le message avec le hint si disponible
      if (data.hint) {
        msg = `${msg} ${data.hint}`
      }

      window.dispatchEvent(new CustomEvent('rate-limit', {
        detail: {
          message: msg,
          retryAfter: data.retryAfter
        }
      }))
      return Promise.reject(error)
    }
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

// Pré-charge le token CSRF au startup
fetchCsrfToken().catch(() => {
  // Pas critique si le fetch échoue au startup
})

export default API

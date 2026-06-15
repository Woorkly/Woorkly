// Service d'authentification — wrapping des endpoints /auth
import API from './api'

// Envoie les identifiants au backend, qui pose un cookie HttpOnly JWT en réponse
const login = async (credentials) => {
  const res = await API.post('/auth/login', credentials)
  return res.data
}

// Demande au backend de supprimer le cookie JWT (déconnexion)
const logout = async () => {
  const res = await API.post('/auth/logout')
  return res.data
}

// Vérifie la session active en utilisant le cookie HttpOnly existant
const me = async () => {
  const res = await API.get('/auth/me')
  return res.data
}

export default { login, logout, me }

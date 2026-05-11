import API from './api'

const login = async (credentials) => {
  // credentials = { email, password }
  const res = await API.post('/auth/login', credentials)
  return res.data
}

const logout = async () => {
  // backend should clear cookie endpoint if implemented
  const res = await API.post('/auth/logout')
  return res.data
}

export default { login, logout }

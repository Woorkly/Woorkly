import API from './api'

const register = async ({ nom, email, password }) => {
  const res = await API.post('/users', {
    nom,
    email,
    password,
    role: 'user'
  })
  return res.data
}

const getAllUsers = async () => {
  const res = await API.get('/users')
  return res.data
}

export default { register, getAllUsers }

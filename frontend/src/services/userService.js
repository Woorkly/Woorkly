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

const updateUserRole = async (id, role) => {
  const res = await API.patch(`/users/${id}`, { role })
  return res.data
}

const deleteUser = async (id) => {
  const res = await API.delete(`/users/${id}`)
  return res.data
}

const getUserReservations = async (id) => {
  const res = await API.get(`/reservations/user/${id}`)
  return res.data
}

export default { register, getAllUsers, updateUserRole, deleteUser, getUserReservations }

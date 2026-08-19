// Service utilisateurs — wrapping des endpoints /users et /upload
import API from './api'
import uploadService from './uploadService'

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
  const res = await API.patch(`/users/${id}/role`, { role })
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

// Upload avatar delegué au service d'upload
const uploadAvatar = async (file) => {
  return uploadService.uploadAvatar(file);
};

const updateMyProfile = async (id, data) => {
  const res = await API.patch(`/users/${id}/profile`, data)
  return res.data
}

export default { register, getAllUsers, updateUserRole, deleteUser, getUserReservations, uploadAvatar, updateMyProfile }

import API from './api'

const createReservation = async (reservationData) => {
  const res = await API.post('/reservations', reservationData)
  return res.data
}

const getMyUpcoming = async () => {
  const res = await API.get('/reservations/me/upcoming')
  return res.data
}

const getMyHistory = async () => {
  const res = await API.get('/reservations/me/history')
  return res.data
}

const getMyStats = async () => {
  const res = await API.get('/reservations/me/stats')
  return res.data
}

const getAllReservations = async () => {
  const res = await API.get('/reservations')
  return res.data
}

const getDisponibilite = async (salleId, date) => {
  const res = await API.get('/reservations/disponibilite', { params: { salle_id: salleId, date } })
  return res.data
}

export default { createReservation, getMyUpcoming, getMyHistory, getMyStats, getAllReservations, getDisponibilite }
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

const getAllReservations = async (filters = {}) => {
  const params = {}
  if (filters.salle_id)        params.salle_id        = filters.salle_id
  if (filters.utilisateur_id)  params.utilisateur_id  = filters.utilisateur_id
  if (filters.statut)          params.statut          = filters.statut
  if (filters.type_reservation) params.type_reservation = filters.type_reservation
  const res = await API.get('/reservations', { params })
  return res.data
}

const getFiltersData = async () => {
  const res = await API.get('/reservations/filters-data')
  return res.data
}

const updateStatut = async (id, statut) => {
  const res = await API.patch(`/reservations/${id}/statut`, { statut })
  return res.data
}

const getDisponibilite = async (salleId, date) => {
  const res = await API.get('/reservations/disponibilite', { params: { salle_id: salleId, date } })
  return res.data
}

export default { createReservation, getMyUpcoming, getMyHistory, getMyStats, getAllReservations, getFiltersData, updateStatut, getDisponibilite }
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

export default { createReservation, getMyUpcoming, getMyHistory }
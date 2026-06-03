import API from './api'

const createReservation = async (reservationData) => {
  const res = await API.post('/reservations', reservationData)
  return res.data
}

export default { createReservation }
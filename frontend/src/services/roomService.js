import api from './api'

/*
  Service des salles
  - Récupère les salles, leurs détails, disponibilités
  - Communique avec /api/rooms du backend
*/

export const roomService = {
  getRooms: async (filters = {}) => {
    const res = await api.get('/rooms', { params: filters })
    return res.data
  },

  getAvailableRooms: async ({ date, ville, capacite_min, type_id }) => {
    const params = {
      date,
      ville: ville || undefined,
      capacite_min: capacite_min || undefined,
      type_id: type_id || undefined,
    }
    const res = await api.get('/rooms/available', { params })
    return res.data
  },

  getRoomById: async (id) => {
    const res = await api.get(`/rooms/${id}`)
    return res.data
  },

  getRoomAvailability: async (id, date) => {
    const res = await api.get(`/rooms/${id}/availability`, { params: { date } })
    return res.data
  },

  createRoom: async (roomData) => {
    const res = await api.post('/rooms', roomData)
    return res.data
  },

  updateRoom: async (id, roomData) => {
    const res = await api.put(`/rooms/${id}`, roomData)
    return res.data
  },

  deleteRoom: async (id) => {
    const res = await api.delete(`/rooms/${id}`)
    return res.data
  },
}

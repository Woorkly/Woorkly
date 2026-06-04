import api from './api'

export const equipmentService = {
  getEquipments: async () => {
    const res = await api.get('/equipements')
    return res.data
  },

  createEquipment: async (name) => {
    const res = await api.post('/equipements', { nom: name })
    return res.data
  },
}

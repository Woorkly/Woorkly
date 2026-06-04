import api from './api'

export const equipmentService = {
  getEquipments: async () => {
    const res = await api.get('/equipements')
    return res.data
  },
}

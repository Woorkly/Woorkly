import api from './api'

export const typeService = {
  getTypes: async () => {
    const res = await api.get('/types')
    return res.data
  },

  createType: async (name) => {
    const res = await api.post('/types', { nom: name })
    return res.data
  },
}

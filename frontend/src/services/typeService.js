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

  deleteType: async (id) => {
    const res = await api.delete(`/types/${id}`)
    return res.data
  },
}

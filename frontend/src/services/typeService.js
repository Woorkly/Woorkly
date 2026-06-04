import api from './api'

export const typeService = {
  getTypes: async () => {
    const res = await api.get('/types')
    return res.data
  },
}

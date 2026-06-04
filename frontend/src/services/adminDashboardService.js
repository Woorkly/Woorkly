import API from './api'

const getDashboardStats = async () => {
  const res = await API.get('/admin/dashboard')
  return res.data
}

export default { getDashboardStats }
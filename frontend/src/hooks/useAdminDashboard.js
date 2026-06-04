import { useEffect, useState } from 'react'
import adminDashboardService from '../services/adminDashboardService'

export default function useAdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await adminDashboardService.getDashboardStats()
        if (isMounted) {
          setDashboard(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return { dashboard, loading, error }
}
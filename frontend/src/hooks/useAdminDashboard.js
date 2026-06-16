// Hook de données pour le dashboard admin.
// Agrège en parallèle 4 sources (dashboard, salles, utilisateurs, réservations)
// et recalcule les KPIs côté client pour afficher les métriques en temps réel.
// Fallback : si les appels parallèles échouent, utilise adminDashboardService seul.
import { useEffect, useState } from 'react'
import adminDashboardService from '../services/adminDashboardService'
import { roomService } from '../services/roomService'
import userService from '../services/userService'
import reservationService from '../services/reservationService'

// Extrait la partie YYYY-MM-DD d'une valeur date (Date, string ISO ou MySQL DATETIME)
const getIsoDateKey = (value) => String(value || '').slice(0, 10)

const getTodayKey = () => {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

const DAILY_AVAILABLE_HOURS = 10

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue) {
    return null
  }

  const [hours, minutes] = String(timeValue).slice(0, 5).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  return hours * 60 + minutes
}

const getReservationDurationHours = (reservation) => {
  const startMinutes = parseTimeToMinutes(reservation.heure_debut)
  const endMinutes = parseTimeToMinutes(reservation.heure_fin)

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return 0
  }

  return (endMinutes - startMinutes) / 60
}

const computeKpis = (rooms = [], users = [], reservations = []) => {
  const todayKey = getTodayKey()
  const todayReservations = reservations.filter((reservation) => {
    return getIsoDateKey(reservation.date) === todayKey && reservation.statut !== 'annulee'
  })

  const totalSalles = rooms.length
  const totalUtilisateurs = users.length
  const reservationsToday = todayReservations.length
  const totalReservedHoursToday = todayReservations.reduce(
    (sum, reservation) => sum + getReservationDurationHours(reservation),
    0
  )
  // Month-to-date occupancy: sum of reservation hours from start of month until today
  const today = new Date()
  const monthKey = today.getMonth() + 1
  const yearKey = today.getFullYear()
  const dayOfMonth = today.getDate()

  const monthReservations = reservations.filter((reservation) => {
    const rDate = String(reservation.date || '').slice(0, 10)
    if (!rDate) return false
    const [y, m] = rDate.split('-')
    return Number(y) === yearKey && Number(m) === monthKey && rDate <= todayKey && reservation.statut !== 'annulee'
  })

  const totalReservedHoursMonthToDate = monthReservations.reduce(
    (sum, reservation) => sum + getReservationDurationHours(reservation),
    0
  )

  const totalAvailableHoursMonthToDate = totalSalles * DAILY_AVAILABLE_HOURS * dayOfMonth
  const tauxOccupation =
    totalAvailableHoursMonthToDate > 0
      ? Math.round((totalReservedHoursMonthToDate / totalAvailableHoursMonthToDate) * 1000) / 10
      : 0

  return {
    total_salles: totalSalles,
    reservations_today: reservationsToday,
    total_utilisateurs: totalUtilisateurs,
    taux_occupation: tauxOccupation,
  }
}

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
        const [dashboardData, rooms, users, reservations] = await Promise.all([
          adminDashboardService.getDashboardStats(),
          roomService.getRooms(),
          userService.getAllUsers(),
          reservationService.getAllReservations(),
        ])

        if (isMounted) {
          setDashboard({
            ...dashboardData,
            kpis: computeKpis(rooms, users, reservations),
          })
        }
      } catch (err) {
        if (!isMounted) return

        try {
          const dashboardData = await adminDashboardService.getDashboardStats()
          setDashboard(dashboardData)
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.message || fallbackErr.message || err.message)
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
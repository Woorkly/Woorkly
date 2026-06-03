import { useState } from 'react'
import reservationService from '../services/reservationService'

export default function useReservation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createReservation = async (reservationData) => {
    setLoading(true)
    setError(null)

    try {
      return await reservationService.createReservation(reservationData)
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createReservation, loading, error }
}
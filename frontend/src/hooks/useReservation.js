// Hook de création de réservation.
// Expose createReservation() avec gestion des états loading/erreur.
// L'erreur est également re-thrown pour que le composant appelant
// puisse l'intercepter et afficher son propre retour visuel.
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
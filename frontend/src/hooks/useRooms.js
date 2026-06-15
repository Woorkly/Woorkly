// Hook de récupération des salles.
// Comportement selon les filtres passés :
//   - filters.roomId → une seule salle (GET /rooms/:id)
//   - filters.date   → salles disponibles ce jour (GET /rooms/available)
//   - aucun filtre   → toutes les salles (GET /rooms)
import { useEffect, useState } from 'react'
import { roomService } from '../services/roomService'

export default function useRooms(filters = {}) {
  const [rooms, setRooms] = useState([])
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      setError(null)
      try {
        if (filters?.roomId) {
          const data = await roomService.getRoomById(filters.roomId)
          setRoom(data)
          setRooms([])
          return
        }

        setRoom(null)

        const data = filters?.date
          ? await roomService.getAvailableRooms(filters)
          : await roomService.getRooms(filters)
        setRooms(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [JSON.stringify(filters)])

  return { rooms, room, loading, error }
}

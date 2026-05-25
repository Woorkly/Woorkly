import { useEffect, useState } from 'react'
import { roomService } from '../services/roomService'

export default function useRooms(filters = {}) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      setError(null)
      try {
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

  return { rooms, loading, error }
}

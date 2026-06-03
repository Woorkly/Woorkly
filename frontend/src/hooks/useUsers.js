import { useEffect, useState } from 'react'
import userService from '../services/userService'

const COLORS = ['#1A56A0', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#0EA5E9', '#EC4899']

function mapUser(u) {
  const initiales = u.nom
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const couleur = COLORS[(u.id - 1) % COLORS.length]
  const role = u.role === 'admin' ? 'Admin' : 'Utilisateur'

  return { ...u, initiales, couleur, role, reservations: [] }
}

export default function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await userService.getAllUsers()
        setUsers(data.map(mapUser))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const updateUserInList = (id, role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  const removeUserFromList = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return { users, loading, error, updateUserInList, removeUserFromList }
}

// Hook consommateur du AuthContext — à utiliser dans tous les composants
// qui ont besoin des données utilisateur ou des actions d'authentification.
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

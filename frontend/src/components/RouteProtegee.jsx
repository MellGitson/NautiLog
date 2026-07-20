import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RouteProtegee({ children, role }) {
  const { estConnecte, aRole } = useAuth()

  if (!estConnecte) {
    return <Navigate to="/connexion" replace />
  }

  if (role && !aRole(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

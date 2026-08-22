import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RouteProtegee({ children, role }) {
  const { estConnecte, aRole } = useAuth()

  if (!estConnecte) {
    return <Navigate to="/connexion" replace />
  }

  const rolesRequis = Array.isArray(role) ? role : (role ? [role] : [])
  if (rolesRequis.length > 0 && !rolesRequis.some(aRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

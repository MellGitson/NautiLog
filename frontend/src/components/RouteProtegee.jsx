import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RouteProtegee({ children }) {
  const { estConnecte } = useAuth()
  return estConnecte ? children : <Navigate to="/connexion" replace />
}

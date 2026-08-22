import api from './api'

export const creerSignalement = (reservationId, message) =>
  api.post('/signalements', { reservationId, message })

export const listerSignalements = () => api.get('/signalements')

export const repondreSignalement = (id, reponse) =>
  api.patch(`/signalements/${id}/repondre`, { reponse })

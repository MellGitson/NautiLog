import api from './api'

const DUREE_CACHE_MS = 10 * 60 * 1000
const cache = new Map()

export const getMeteo = async (portId) => {
  const entree = cache.get(portId)
  if (entree && Date.now() - entree.date < DUREE_CACHE_MS) {
    return entree.donnees
  }

  const { data } = await api.get(`/ports/${portId}/meteo`)
  cache.set(portId, { donnees: data, date: Date.now() })
  return data
}

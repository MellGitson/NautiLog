import { useState } from 'react'

export function useFormulaire(valeursInitiales) {
  const [valeurs, setValeurs] = useState(valeursInitiales)
  const [erreur, setErreur] = useState(null)
  const [chargement, setChargement] = useState(false)

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const gererSoumission = (callback) => async (e) => {
    e.preventDefault()
    setErreur(null)
    setChargement(true)
    try {
      await callback(valeurs)
    } catch (err) {
      const message =
        err.response?.data?.errors?.email ||
        err.response?.data?.errors?.password ||
        err.response?.data?.message ||
        'Une erreur est survenue.'
      setErreur(message)
    } finally {
      setChargement(false)
    }
  }

  return { valeurs, erreur, chargement, gererChangement, gererSoumission }
}

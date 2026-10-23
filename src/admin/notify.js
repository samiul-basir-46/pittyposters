import { createContext, useContext } from 'react'

export const NotifyContext = createContext(() => {})
export const useNotify = () => useContext(NotifyContext)

// Shows a success toast, or an error if the browser could not save (storage full).
export function useSaved() {
  const notify = useNotify()
  return (ok, message = 'Saved') =>
    ok === false
      ? notify('Could not save: browser storage is full. Use smaller images or delete some posters.', 'error')
      : notify(message)
}

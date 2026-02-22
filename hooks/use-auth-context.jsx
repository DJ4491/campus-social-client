import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  signOut: async () => {},
})

export const useAuthContext = () => useContext(AuthContext)

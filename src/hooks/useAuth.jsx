import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const requireAuth = () => {
    if (!auth) {
      const err = new Error('Firebase 환경변수가 설정되지 않았어요')
      err.code = 'app/firebase-not-configured'
      throw err
    }
    return auth
  }

  const signIn = (email, password) => signInWithEmailAndPassword(requireAuth(), email, password)

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(requireAuth(), email, password)
    if (displayName) {
      await updateProfile(cred.user, { displayName })
    }
    return cred
  }

  const signOut = () => fbSignOut(requireAuth())

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

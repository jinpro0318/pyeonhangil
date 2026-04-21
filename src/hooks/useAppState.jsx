import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'pyeonhangil_state'

const defaultState = {
  user: {
    name: '사용자',
    walkState: 'slow', // slow | very-slow | needs-help | stroller
  },
  destination: null,
  activeRoute: null, // { coords:[{lat,lng}], distanceMeters, durationSeconds, source }
  family: [],
  favorites: [
    { id: 'home', name: '우리 집', emoji: '🏠', address: '서울 종로구 종로 12' },
    { id: 'hospital', name: '병원', emoji: '🏥', address: '서울대학교병원' },
    { id: 'mart', name: '마트', emoji: '🛒', address: '이마트' },
  ],
}

export const WALK_STATES = {
  slow: {
    id: 'slow',
    emoji: '🟢',
    name: '조금 느려요',
    desc: '천천히 걷지만 혼자 다녀요',
    speed: '0.7~0.9m/초',
    color: 'walk-green',
  },
  'very-slow': {
    id: 'very-slow',
    emoji: '🟡',
    name: '많이 느려요',
    desc: '지팡이·자주 쉼 필요',
    speed: '0.5~0.7m/초',
    color: 'walk-yellow',
  },
  'needs-help': {
    id: 'needs-help',
    emoji: '🔴',
    name: '도움이 필요해요',
    desc: '휠체어·보행기·시각장애',
    speed: '0.4m/초 이하',
    color: 'walk-red',
  },
  stroller: {
    id: 'stroller',
    emoji: '👶',
    name: '유모차예요',
    desc: '아이와 함께 다녀요',
    speed: '0.6~0.8m/초',
    color: 'walk-stroller',
  },
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const updateUser = (updates) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...updates } }))
  }

  const setDestination = (dest) => {
    setState((prev) => ({ ...prev, destination: dest }))
  }

  const setActiveRoute = (route) => {
    setState((prev) => ({ ...prev, activeRoute: route }))
  }

  const addFamily = (member) => {
    setState((prev) => ({
      ...prev,
      family: [...prev.family, { ...member, id: Date.now().toString() }],
    }))
  }

  return (
    <AppContext.Provider
      value={{
        state,
        updateUser,
        setDestination,
        setActiveRoute,
        addFamily,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be inside AppProvider')
  return ctx
}

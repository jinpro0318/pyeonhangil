import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'pyeonhangil_state'

export const FONT_SIZES = {
  sm: { id: 'sm', label: '작게', scale: 0.9 },
  md: { id: 'md', label: '보통', scale: 1.0 },
  lg: { id: 'lg', label: '크게', scale: 1.15 },
  xl: { id: 'xl', label: '아주 크게', scale: 1.3 },
}

const defaultState = {
  user: {
    name: '사용자',
    walkState: 'older',
    fontSize: 'md',
  },
  destination: null,
  activeRoute: null,
  family: [
    {
      id: 'fam_seed_1',
      name: '딸 영수',
      relation: '딸',
      phone: '',
      status: 'connected',
      invitedAt: null,
      connectedAt: Date.now(),
      receiveSOS: true,
    },
  ],
  emergencyContacts: [],
  favorites: [
    { id: 'home', name: '우리 집', emoji: '🏠', icon: 'home', address: '서울 종로구 종로 12', lat: 37.5704, lng: 126.9927 },
    { id: 'hospital', name: '서울대학교병원', emoji: '🏥', icon: 'hospital', address: '서울 종로구 대학로 101', lat: 37.579617, lng: 126.998292 },
    { id: 'mart', name: '이마트 청계천점', emoji: '🛒', icon: 'cart', address: '서울 중구 을지로', lat: 37.5663, lng: 126.9977 },
  ],
}

export const WALK_STATES = {
  older: {
    id: 'older',
    emoji: '👵',
    name: '고령자',
    desc: '계단·경사를 피하고, 긴 거리는 대중교통으로 나눠 안내해요',
    speed: '0.6~0.8m/초',
    color: 'older',
  },
  wheelchair: {
    id: 'wheelchair',
    emoji: '♿',
    name: '휠체어·보행기',
    desc: '엘리베이터·경사로와 저상버스·환승 동선을 우선해요',
    speed: '0.4~0.6m/초',
    color: 'wheelchair',
  },
  visual: {
    id: 'visual',
    emoji: '🦯',
    name: '시각장애인',
    desc: '횡단보도·승하차 등 안전 안내를 음성으로 강화해요',
    speed: '0.5~0.7m/초',
    color: 'visual',
  },
  stroller: {
    id: 'stroller',
    emoji: '👶',
    name: '유모차 동반',
    desc: '엘리베이터·턱 없는 길과 타기 쉬운 교통편을 우선해요',
    speed: '0.6~0.8m/초',
    color: 'stroller',
  },
  injured: {
    id: 'injured',
    emoji: '🩼',
    name: '일시적 부상자',
    desc: '짧은 보행과 쉴 곳, 대중교통 이용을 우선해요',
    speed: '0.5~0.7m/초',
    color: 'injured',
  },
}

function migrate(parsed) {
  const user = { ...defaultState.user, ...(parsed.user || {}) }
  if (!FONT_SIZES[user.fontSize]) user.fontSize = 'md'
  if (!WALK_STATES[user.walkState]) user.walkState = defaultState.user.walkState

  const favorites = Array.isArray(parsed.favorites) && parsed.favorites.every((f) => f.lat && f.lng)
    ? parsed.favorites
    : defaultState.favorites

  const family = Array.isArray(parsed.family) && parsed.family.length > 0
    ? parsed.family
    : defaultState.family

  const emergencyContacts = Array.isArray(parsed.emergencyContacts)
    ? parsed.emergencyContacts
    : defaultState.emergencyContacts

  return {
    ...defaultState,
    ...parsed,
    user,
    favorites,
    family,
    emergencyContacts,
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return defaultState
      return migrate(JSON.parse(saved))
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  // 글씨 크기를 :root 에 반영 (모든 페이지 즉시 적용)
  useEffect(() => {
    const scale = FONT_SIZES[state.user.fontSize]?.scale ?? 1
    document.documentElement.style.setProperty('--font-scale', String(scale))
  }, [state.user.fontSize])

  const updateUser = (updates) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...updates } }))
  }

  const setDestination = (dest) => {
    setState((prev) => ({ ...prev, destination: dest }))
  }

  const setActiveRoute = (route) => {
    setState((prev) => ({ ...prev, activeRoute: route }))
  }

  // 가족
  const addFamily = (member) => {
    setState((prev) => ({
      ...prev,
      family: [
        ...prev.family,
        {
          id: `fam_${Date.now()}`,
          status: 'pending',
          invitedAt: Date.now(),
          connectedAt: null,
          receiveSOS: true,
          ...member,
        },
      ],
    }))
  }
  const updateFamily = (id, updates) => {
    setState((prev) => ({
      ...prev,
      family: prev.family.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }
  const removeFamily = (id) => {
    setState((prev) => ({ ...prev, family: prev.family.filter((f) => f.id !== id) }))
  }

  // 초대 토큰으로 가족 연결 수락 → 해당 멤버를 connected 로 등록. 매칭 멤버 반환(없으면 null)
  const acceptInvite = (token) => {
    if (!token) return null
    const member = state.family.find((f) => f.inviteToken === token)
    if (!member) return null
    if (member.status !== 'connected') {
      updateFamily(member.id, { status: 'connected', connectedAt: Date.now() })
    }
    return member
  }

  // 즐겨찾기
  const addFavorite = (fav) => {
    setState((prev) => ({
      ...prev,
      favorites: [...prev.favorites, { id: `fav_${Date.now()}`, emoji: '⭐', icon: 'star', ...fav }],
    }))
  }
  const updateFavorite = (id, updates) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }
  const removeFavorite = (id) => {
    setState((prev) => ({ ...prev, favorites: prev.favorites.filter((f) => f.id !== id) }))
  }

  // 긴급 연락처
  const addEmergencyContact = (contact) => {
    setState((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { id: `ec_${Date.now()}`, ...contact },
      ],
    }))
  }
  const updateEmergencyContact = (id, updates) => {
    setState((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  }
  const removeEmergencyContact = (id) => {
    setState((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== id),
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
        updateFamily,
        removeFamily,
        acceptInvite,
        addFavorite,
        updateFavorite,
        removeFavorite,
        addEmergencyContact,
        updateEmergencyContact,
        removeEmergencyContact,
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Footprints, Clock, Phone, Tag, Star, Accessibility, X,
} from 'lucide-react'
import { POI_TYPES } from '../data/pois'
import { formatDistance } from '../utils/geo'
import { fetchPlaceDetail } from '../services/placeApi'
import { Button } from './ui/button'
import { IconBadge, poiIcon } from '@/lib/catalog'

export default function PoiDetailCard({ poi, onClose }) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!poi) return
    setDetail(null)
    if (typeof poi.id === 'string' && poi.id.startsWith('kakao_')) {
      setLoading(true)
      fetchPlaceDetail(poi).then((d) => {
        setDetail(d)
        setLoading(false)
      })
    }
  }, [poi])

  if (!poi) return null

  const meta = POI_TYPES[poi.type] || { label: '장소', emoji: '📍', color: '#3182F6' }

  const handleNavigate = () => {
    navigate('/route', {
      state: {
        destination: {
          name: poi.name,
          address: detail?.address || poi.address || poi.description || '',
          emoji: meta.emoji,
          lat: poi.lat,
          lng: poi.lng,
        },
      },
    })
  }

  const phone = detail?.phone || poi.phone
  const address = detail?.address || poi.address || poi.description
  const category = detail?.category || poi.categoryName

  return (
    <div
      className="fixed inset-0 z-[180] bg-primary-800/35 backdrop-blur-sm flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-slide-up border border-ink-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-ink-200 rounded-full" />
        </div>

        <div className="px-5 pb-5">
          {/* 헤더 */}
          <div className="flex items-start gap-3 mb-4 pr-10 relative">
            <IconBadge Icon={poiIcon(poi.type).Icon} tone={poiIcon(poi.type).tone} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-xl font-extrabold tracking-normal">{poi.name}</div>
              <div className="text-sm text-ink-500 font-semibold mt-0.5 flex items-center gap-1">
                {meta.label}
                {detail?.rating && (
                  <>
                    <span className="mx-1">·</span>
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="text-ink-700 font-bold">{detail.rating}</span>
                    {detail.reviewCount > 0 && (
                      <span className="text-ink-400">({detail.reviewCount})</span>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 top-0 w-9 h-9 rounded-lg grid place-items-center text-ink-500 hover:bg-ink-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 사진 */}
          {detail?.photos?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 mb-4">
              {detail.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  loading="lazy"
                  className="w-32 h-24 object-cover rounded-xl flex-shrink-0"
                />
              ))}
            </div>
          )}

          {/* 정보 행 */}
          <div className="space-y-2.5 mb-4">
            {address && (
              <InfoRow Icon={MapPin}>{address}</InfoRow>
            )}
            {poi.distance != null && (
              <InfoRow Icon={Footprints}>여기서 {formatDistance(poi.distance)}</InfoRow>
            )}
            {detail?.hours?.length > 0 && (
              <InfoRow Icon={Clock}>
                {detail.hours
                  .filter((h) => h.open)
                  .map((h) => `${h.day} ${h.open}`)
                  .join(' · ') || '시간 정보 없음'}
              </InfoRow>
            )}
            {phone && (
              <InfoRow Icon={Phone}>
                <a href={`tel:${phone}`} className="text-primary font-semibold">{phone}</a>
              </InfoRow>
            )}
            {category && (
              <InfoRow Icon={Tag}>{category}</InfoRow>
            )}
          </div>

          {/* 무장애 시설 태그 */}
          {detail?.accessibility?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {detail.accessibility.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-50 text-success-600 rounded-full text-xs font-bold"
                >
                  <Accessibility className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}

          {loading && (
            <div className="text-center text-sm text-ink-500 py-2">상세 정보 불러오는 중...</div>
          )}

          {poi.source && (
            <div className="text-xs text-ink-400 text-center mb-3">출처 · {poi.source}</div>
          )}

          <Button size="lg" className="w-full" onClick={handleNavigate}>
            여기로 가는 편한 길
          </Button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ Icon, children }) {
  return (
    <div className="flex items-start gap-3 text-[15px] text-ink-700">
      <Icon className="w-[18px] h-[18px] mt-0.5 text-ink-400 flex-shrink-0" />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  )
}

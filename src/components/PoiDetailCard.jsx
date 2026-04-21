import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { POI_TYPES } from '../data/pois'
import { formatDistance } from '../utils/geo'
import { fetchPlaceDetail } from '../services/placeApi'
import './PoiDetailCard.css'

export default function PoiDetailCard({ poi, onClose }) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!poi) return
    setDetail(null)
    // 카카오 POI 만 상세 조회 시도 (그 외는 기본 정보로만 표시)
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
    <div className="poi-card-backdrop" onClick={onClose}>
      <div className="poi-card" onClick={(e) => e.stopPropagation()}>
        <div className="poi-card-handle" />

        <div className="poi-card-head">
          <div
            className="poi-card-icon"
            style={{ background: meta.color + '22', color: meta.color }}
          >
            {meta.emoji}
          </div>
          <div className="poi-card-title-wrap">
            <div className="poi-card-name">{poi.name}</div>
            <div className="poi-card-type">
              {meta.label}
              {detail?.rating && (
                <>
                  {' · '}
                  <span className="poi-card-rating">
                    ★ {detail.rating}
                    {detail.reviewCount > 0 && (
                      <span className="poi-card-rating-cnt"> ({detail.reviewCount})</span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="poi-card-close" onClick={onClose} aria-label="닫기">×</button>
        </div>

        <div className="poi-card-body">
          {/* 사진 */}
          {detail?.photos?.length > 0 && (
            <div className="poi-card-photos no-scrollbar">
              {detail.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  loading="lazy"
                  className="poi-card-photo"
                />
              ))}
            </div>
          )}

          {/* 주소 */}
          {address && (
            <div className="poi-card-row">
              <span className="poi-card-row-icon">📍</span>
              <span>{address}</span>
            </div>
          )}

          {/* 거리 */}
          {poi.distance != null && (
            <div className="poi-card-row">
              <span className="poi-card-row-icon">🚶</span>
              <span>여기서 {formatDistance(poi.distance)}</span>
            </div>
          )}

          {/* 영업시간 */}
          {detail?.hours?.length > 0 && (
            <div className="poi-card-row">
              <span className="poi-card-row-icon">🕒</span>
              <span>
                {detail.hours
                  .filter((h) => h.open)
                  .map((h) => `${h.day} ${h.open}`)
                  .join(' · ') || '시간 정보 없음'}
              </span>
            </div>
          )}

          {/* 전화 */}
          {phone && (
            <div className="poi-card-row">
              <span className="poi-card-row-icon">📞</span>
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
          )}

          {/* 카테고리 */}
          {category && (
            <div className="poi-card-row">
              <span className="poi-card-row-icon">🏷️</span>
              <span className="poi-card-cat">{category}</span>
            </div>
          )}

          {/* 무장애 시설 태그 */}
          {detail?.accessibility?.length > 0 && (
            <div className="poi-card-tags">
              {detail.accessibility.map((tag) => (
                <span key={tag} className="poi-card-tag accessible">
                  ♿ {tag}
                </span>
              ))}
            </div>
          )}

          {loading && (
            <div className="poi-card-loading">상세 정보 불러오는 중...</div>
          )}

          {poi.source && (
            <div className="poi-card-source">출처 · {poi.source}</div>
          )}
        </div>

        <button className="btn large" onClick={handleNavigate}>
          여기로 가는 편한 길
        </button>
      </div>
    </div>
  )
}

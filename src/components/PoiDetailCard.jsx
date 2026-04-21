import { useNavigate } from 'react-router-dom'
import { POI_TYPES } from '../data/pois'
import { formatDistance } from '../utils/geo'
import './PoiDetailCard.css'

export default function PoiDetailCard({ poi, onClose }) {
  const navigate = useNavigate()
  if (!poi) return null

  const meta = POI_TYPES[poi.type] || { label: '장소', emoji: '📍', color: '#3182F6' }

  const handleNavigate = () => {
    navigate('/route', {
      state: {
        destination: {
          name: poi.name,
          address: poi.address || poi.description || '',
          emoji: meta.emoji,
          lat: poi.lat,
          lng: poi.lng,
        },
      },
    })
  }

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
            <div className="poi-card-type">{meta.label}</div>
          </div>
          <button className="poi-card-close" onClick={onClose} aria-label="닫기">×</button>
        </div>

        {(poi.address || poi.description) && (
          <div className="poi-card-row">
            <span className="poi-card-row-icon">📍</span>
            <span>{poi.address || poi.description}</span>
          </div>
        )}

        {poi.distance != null && (
          <div className="poi-card-row">
            <span className="poi-card-row-icon">🚶</span>
            <span>여기서 {formatDistance(poi.distance)}</span>
          </div>
        )}

        {poi.phone && (
          <div className="poi-card-row">
            <span className="poi-card-row-icon">📞</span>
            <a href={`tel:${poi.phone}`}>{poi.phone}</a>
          </div>
        )}

        {poi.categoryName && (
          <div className="poi-card-row">
            <span className="poi-card-row-icon">🏷️</span>
            <span className="poi-card-cat">{poi.categoryName}</span>
          </div>
        )}

        {poi.source && (
          <div className="poi-card-source">출처 · {poi.source}</div>
        )}

        <div className="poi-card-actions">
          <button className="btn large" onClick={handleNavigate}>
            여기로 가는 편한 길
          </button>
          {poi.url && (
            <a
              className="btn secondary"
              href={poi.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              카카오맵에서 자세히 보기 ›
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

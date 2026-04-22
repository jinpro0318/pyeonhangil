import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGPS } from '../hooks/useGPS'
import { useKakaoMap } from '../hooks/useKakaoMap'
import {
  REPORT_TYPES,
  addReport,
  agreeReport,
  getActiveReports,
  removeReport,
  reportToPoi,
} from '../services/reportsStore'
import TabBar from '../components/TabBar'
import './Community.css'

function formatAgo(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  return `${d}일 전`
}

export default function Community() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { position, start } = useGPS({ enableStayDetection: false })

  const [reports, setReports] = useState(getActiveReports())
  const [showForm, setShowForm] = useState(false)
  const [pickedLocation, setPickedLocation] = useState(null) // 지도에서 고른 좌표
  const [form, setForm] = useState({ type: 'construction', description: '' })

  useEffect(() => {
    start()
  }, [start])

  const refresh = () => setReports(getActiveReports())

  const { isReady, error } = useKakaoMap(mapRef, {
    pois: reports.map(reportToPoi),
    center: position,
    myLocation: position,
    level: 5,
  })

  const handleSubmit = () => {
    const loc = pickedLocation || position
    if (!loc?.lat) {
      alert('위치를 확인할 수 없어요. GPS를 켜주세요.')
      return
    }
    addReport({
      lat: loc.lat,
      lng: loc.lng,
      type: form.type,
      description: form.description,
    })
    setShowForm(false)
    setPickedLocation(null)
    setForm({ type: 'construction', description: '' })
    refresh()
  }

  const handleDelete = (id) => {
    if (!confirm('이 제보를 삭제할까요?')) return
    removeReport(id)
    refresh()
  }

  const handleAgree = (id) => {
    agreeReport(id)
    refresh()
  }

  return (
    <>
      <div className="community-page">
        <div className="community-header">
          <h2>커뮤니티 제보</h2>
          <p className="community-sub">
            공사·통행불가·계단 등 길 정보를 공유해 주세요. 지도에 바로 반영돼요.
          </p>
        </div>

        <div className="community-map" ref={mapRef}>
          {!isReady && !error && (
            <div className="community-map-fallback">🗺️ 지도 불러오는 중…</div>
          )}
          {error && <div className="community-map-fallback">{error}</div>}
        </div>

        <div className="community-list no-scrollbar">
          {reports.length === 0 ? (
            <div className="community-empty">
              <div className="community-empty-icon">📝</div>
              <div>아직 제보가 없어요</div>
              <div className="community-empty-sub">
                길에서 본 공사·장애물을 아래 버튼으로 공유해 주세요
              </div>
            </div>
          ) : (
            reports.map((r) => {
              const meta = REPORT_TYPES[r.type] || REPORT_TYPES.other
              return (
                <div key={r.id} className="report-card">
                  <div
                    className="report-icon"
                    style={{ background: meta.color + '22', color: meta.color }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="report-body">
                    <div className="report-title">{meta.label}</div>
                    {r.description && (
                      <div className="report-desc">{r.description}</div>
                    )}
                    <div className="report-meta">
                      📍 {r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {formatAgo(r.timestamp)}
                    </div>
                    <div className="report-actions">
                      <button onClick={() => handleAgree(r.id)} className="report-btn">
                        👍 동의 {r.agrees > 0 ? r.agrees : ''}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="report-btn ghost"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button
          className="community-fab"
          onClick={() => setShowForm(true)}
          aria-label="새 제보 작성"
        >
          +
        </button>

        {showForm && (
          <div className="community-form-backdrop" onClick={() => setShowForm(false)}>
            <div className="community-form" onClick={(e) => e.stopPropagation()}>
              <div className="community-form-handle" />
              <h3>길 제보하기</h3>

              <label className="community-field-label">어떤 상황인가요?</label>
              <div className="community-type-grid">
                {Object.entries(REPORT_TYPES).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    className={`community-type-btn ${form.type === key ? 'active' : ''}`}
                    style={form.type === key ? { borderColor: meta.color, background: meta.color + '15' } : {}}
                    onClick={() => setForm((f) => ({ ...f, type: key }))}
                  >
                    <div className="community-type-emoji">{meta.emoji}</div>
                    <div className="community-type-label">{meta.label}</div>
                  </button>
                ))}
              </div>

              <label className="community-field-label">설명 (선택)</label>
              <textarea
                className="community-textarea"
                placeholder="예) 북쪽 인도에 펜스로 막혀 있어요"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={200}
                rows={3}
              />

              <label className="community-field-label">위치</label>
              <div className="community-location">
                {pickedLocation ? (
                  <>
                    <span>📍 {pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)}</span>
                    <button className="community-loc-reset" onClick={() => setPickedLocation(null)}>
                      초기화
                    </button>
                  </>
                ) : position?.lat ? (
                  <span>📍 현재 위치 사용: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                ) : (
                  <span style={{ color: 'var(--walk-yellow)' }}>⚠️ GPS 위치 확인 중…</span>
                )}
              </div>

              <div className="community-form-footer">
                <button className="btn secondary" onClick={() => setShowForm(false)}>
                  취소
                </button>
                <button className="btn" onClick={handleSubmit}>
                  제보 등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <TabBar />
    </>
  )
}

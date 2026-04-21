import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar'
import './Family.css'

export default function Family() {
  const navigate = useNavigate()

  const handleInvite = () => {
    const name = prompt('초대할 가족의 이름을 입력하세요')
    if (name) {
      alert(`${name}님에게 초대 링크를 보냈어요`)
    }
  }

  return (
    <>
      <div className="family-page">
        <div className="family-header">
          <h2>우리 가족</h2>
        </div>

        <div className="family-body no-scrollbar">
          <div className="family-banner">
            <div className="family-banner-icon">✓</div>
            <div>
              <div className="family-banner-label">걱정 마세요</div>
              <div className="family-banner-title">
                딸에게 자동으로 알려드려요
              </div>
            </div>
          </div>

          <div className="list-label">내 가족</div>

          <div className="action-card">
            <div
              className="action-card-icon"
              style={{ background: 'var(--cat-rest-soft)', color: 'var(--cat-rest)' }}
            >
              영
            </div>
            <div className="action-card-text">
              <div className="t">딸 영수</div>
              <div className="s" style={{ color: 'var(--cat-rest)', fontWeight: 700 }}>
                ✓ 연결됨 · 모든 알림 받음
              </div>
            </div>
          </div>

          <div
            className="action-card"
            style={{
              background: 'var(--walk-yellow-soft)',
            }}
          >
            <div
              className="action-card-icon"
              style={{ background: 'white', color: 'var(--walk-yellow)' }}
            >
              아
            </div>
            <div className="action-card-text">
              <div className="t">아들 민수</div>
              <div
                className="s"
                style={{ color: 'var(--walk-yellow)', fontWeight: 700 }}
              >
                ⏳ 초대 대기 · 3일 전 전송
              </div>
            </div>
          </div>

          <button className="btn secondary large" onClick={handleInvite}>
            + 가족 더 초대하기
          </button>
        </div>
      </div>
      <TabBar />
    </>
  )
}

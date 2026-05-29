import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * 사용자 제보 사진을 Firebase Storage 에 업로드 후 download URL 반환
 * - 경로: reports/{reportId}.jpg
 * - 파일이 너무 크면(>1.5MB) 클라이언트에서 리사이즈 후 업로드
 * - 실패 시 throw — 호출 측에서 ui 처리
 */
export async function uploadReportPhoto(file, reportId) {
  if (!storage) throw new Error('Firebase Storage 가 설정되지 않았어요')
  if (!file) throw new Error('파일이 없어요')

  const blob = file.size > 1_500_000 ? await resizeImage(file, 1280, 0.8) : file
  const path = `reports/${reportId}.jpg`
  const r = ref(storage, path)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(r)
}

/**
 * 이미지 리사이즈 — 긴 변이 maxSide 이하가 되도록 축소, JPEG 로 인코딩
 */
function resizeImage(file, maxSide = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const longSide = Math.max(img.width, img.height)
      const scale = longSide > maxSide ? maxSide / longSide : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) reject(new Error('canvas blob 실패'))
          else resolve(blob)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지 로드 실패'))
    }
    img.src = url
  })
}

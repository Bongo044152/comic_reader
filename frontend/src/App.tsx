import { useState } from 'react'
import axios from 'axios'
import { getBackendMessage } from './api/backend'

type ApiState = 'idle' | 'loading' | 'success' | 'error'

function App() {
  const [apiMessage, setApiMessage] = useState('')
  const [apiState, setApiState] = useState<ApiState>('idle')

  async function checkBackend() {
    setApiState('loading')
    setApiMessage('')

    try {
      setApiMessage(await getBackendMessage())
      setApiState('success')
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.status
          ? `HTTP ${error.response.status}`
          : error.message
        : error instanceof Error
          ? error.message
          : '連線失敗'
      setApiMessage(message)
      setApiState('error')
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="漫畫閱讀器首頁">
          <span className="brand-mark">漫</span>
          <span>漫讀</span>
        </a>
        <span className="topbar-note">你的下一頁，從這裡開始</span>
      </header>

      <section className="welcome-card">
        <div className="welcome-copy">
          <p className="eyebrow">COMIC READER · FRONTEND</p>
          <h1>漫畫閱讀器<br /><span>前端環境已就緒。</span></h1>
          <p className="description">
            這裡會逐步長成你的漫畫書庫。先測試前端能不能順利連到後端 API。
          </p>
          <button className="check-button" onClick={checkBackend} disabled={apiState === 'loading'}>
            {apiState === 'loading' ? '連線中…' : '測試後端連線'}
            <span aria-hidden="true">→</span>
          </button>
          {apiMessage && (
            <p className={`api-result ${apiState}`} role="status">
              {apiState === 'success' ? `後端回應：${apiMessage}` : `無法連線：${apiMessage}`}
            </p>
          )}
        </div>
        <div className="book-art" aria-hidden="true">
          <div className="sun" />
          <div className="book book-back"><span>STORY<br />AWAITS</span></div>
          <div className="book book-front"><span className="book-label">VOL. 01</span><span className="book-title">下一頁<br />的故事</span><span className="book-line" /></div>
          <span className="spark spark-one">✳</span>
          <span className="spark spark-two">✦</span>
        </div>
      </section>

      <footer className="page-footer"><span>React + TypeScript + Vite</span><span>慢慢讀，讀喜歡的故事。</span></footer>
    </main>
  )
}

export default App

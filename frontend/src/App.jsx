import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

function App() {
  // Input states
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Technology')
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  // App & Download status states
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [activeTab, setActiveTab] = useState('Technology')

  // Data models loaded from server
  const [categories, setCategories] = useState(["Motivation", "Technology", "Future Scope", "Intern"])
  const [savedVideos, setSavedVideos] = useState([])

  const playerRef = useRef(null)

  // Fetch saved video inventory on component mount
  useEffect(() => {
    fetchSavedData()
  }, [])

  const fetchSavedData = async () => {
    try {
      const res = await fetch('/api/videos-metadata')
      const data = await res.json()
      if (data.categories) setCategories(data.categories)
      if (data.videos) setSavedVideos(data.videos)
    } catch (err) {
      console.error("Error reading backend data database:", err)
    }
  }

  const triggerDownload = () => {
    if (!url) return alert('Please enter a YouTube link first!')
    setStatus('Initializing clip download thread...')
    setProgress(1)

    // Construct local relative path mapped via Vite Proxy setup
    const eventSource = new EventSource(
      `/api/download-progress?url=${encodeURIComponent(url)}&startTime=${startTime}&endTime=${endTime}&category=${category}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.progress) {
        setProgress(parseFloat(data.progress))
        setStatus(`Downloading file payload: ${data.progress}%`)
      }

      if (data.status === 'complete') {
        setStatus('Saved securely offline!')
        setProgress(100)
        eventSource.close()
        fetchSavedData() // Reload media grid instantly
      }

      if (data.error) {
        setStatus(`Failure state: ${data.error}`)
        eventSource.close()
      }
    };

    eventSource.onerror = () => {
      setStatus('Network stream interface closed.')
      eventSource.close()
    };
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <h2>📺 Workspace Vault Studio</h2>
      </header>

      {/* SECTION A: SAVE & LOGGER WORKBENCH */}
      <section style={{ background: '#212121', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
        <h3>Clip New Lecture Video</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Paste YouTube Video / Shorts URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', background: '#3a3a3a', color: '#fff' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', background: '#3a3a3a', color: '#fff', border: 'none' }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {url && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ maxWidth: '480px', borderRadius: '8px', overflow: 'hidden' }}>
              <ReactPlayer ref={playerRef} url={url} controls width="100%" height="270px" />
            </div>

            <div style={{ display: 'flex', gap: '20px', margin: '16px 0' }}>
              <div>
                <label>Start Window: </label>
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  style={{ width: '70px', padding: '4px', marginLeft: '6px' }}
                />s
                <button
                  onClick={() => setStartTime(Math.floor(playerRef.current.getCurrentTime()))}
                  style={{ marginLeft: '8px', padding: '4px 8px', cursor: 'pointer' }}
                >Use Current Time</button>
              </div>
              <div>
                <label>End Window: </label>
                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  style={{ width: '70px', padding: '4px', marginLeft: '6px' }}
                />s
                <button
                  onClick={() => setEndTime(Math.floor(playerRef.current.getCurrentTime()))}
                  style={{ marginLeft: '8px', padding: '4px 8px', cursor: 'pointer' }}
                >Use Current Time</button>
              </div>
            </div>

            <button
              onClick={triggerDownload}
              style={{ background: '#cc0000', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cut & Download Segment Offline
            </button>
          </div>
        )}

        {progress > 0 && (
          <div style={{ marginTop: '16px' }}>
            <progress value={progress} max="100" style={{ width: '100%', height: '10px' }} />
            <p style={{ fontSize: '14px', color: '#aaa' }}>{status}</p>
          </div>
        )}
      </section>

      {/* SECTION B: YOUTUBE FILTER GRID SYSTEM */}
      <section>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === cat ? '#fff' : '#272727',
                color: activeTab === cat ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Media Video Card Grid Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {savedVideos.filter(v => v.category === activeTab).map(video => (
            <div key={video.id} style={{ background: '#1c1c1c', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Native HTML5 video component streaming from backend public asset folder */}
              <video
                src={video.videoPath}
                controls
                poster={video.thumbnailPath}
                style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}
              />
              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', lineInterspace: '1.4' }}>{video.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                  Clip Window: {video.clips[0].start}s - {video.clips[0].end}s
                </p>
              </div>
            </div>
          ))}
        </div>

        {savedVideos.filter(v => v.category === activeTab).length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No local offline video assets saved inside this matrix layer yet.</p>
        )}
      </section>
    </div>
  )
}

export default App
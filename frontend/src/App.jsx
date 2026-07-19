import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  // new category + button
  const [newCategoryInput, setNewCategoryInput] = useState(false);
  // removed cause dint work with react video player
  //const playerRef = useRef(null)

  // notes adding
  const [note, setNote] = useState('');
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

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
    // getting the notes
    const eventSource = new EventSource(
      `/api/download-progress?url=${encodeURIComponent(url)}&startTime=${startTime}&endTime=${endTime}&category=${category}&note=${encodeURIComponent(note)}`
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
        setNote('') // Clear note input state box automatically
        eventSource.close()
        fetchSavedData()
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
  // convert seconds to 2:10
  const formatTimeDisplay = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    const paddedS = s < 10 ? `0${s}` : s;
    if (h > 0) {
      return `${h}:${m < 10 ? `0${m}` : m}:${paddedS}`;
    }
    return `${m}:${paddedS}`;
  };


  // Helper to turn HH:MM:SS, MM:SS, or SS into pure seconds
  const convertToSeconds = (timeStr) => {
    if (typeof timeStr === 'number') return timeStr;
    const parts = timeStr.split(':').map(num => parseInt(num, 10) || 0);

    if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  };
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <h2>📺 Youtube Save Video</h2>
      </header>

      {/* SECTION A: SAVE & LOGGER WORKBENCH */}
      <section style={{ background: '#212121', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
        <h3>Add New Lecture Video</h3>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', background: '#3a3a3a', color: '#fff', border: 'none' }}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <button
            type="button"
            onClick={async () => {
              const newCat = prompt("Enter new category name:");
              if (!newCat) return;
              const trimmed = newCat.trim();
              if (trimmed && !categories.includes(trimmed)) {
                // Optimistically add to frontend local state UI arrays instantly
                const updatedCats = [...categories, trimmed];
                setCategories(updatedCats);
                setCategory(trimmed);
                setActiveTab(trimmed);

                // Commit persistently to videos.json database on the backend cluster
                try {
                  await fetch('/api/add-category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: trimmed })
                  });
                } catch (err) {
                  console.error("Failed to sync new category metadata down to server:", err);
                }
              }
            }}
            style={{ padding: '10px 14px', borderRadius: '4px', background: '#333', color: '#ffc107', border: '1px dashed #ffc107', fontWeight: 'bold', cursor: 'pointer' }}
            title="Create custom category folder"
          >
            +
          </button>
        </div>

        {url && (
          <div style={{ marginTop: '16px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '24px 0', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '14px' }}>Adjust Timeline Progress Windows</h4>

              {/* Start Handle Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>Start Marker:</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>
                    {/* Formats seconds to HH:MM:SS on the fly */}
                    {new Date(startTime * 1000).toISOString().substring(11, 19)} ({startTime}s)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3600" // Adjust to your average lecture duration (e.g., 3600 = 1 hour)
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#ff0000' }}
                />
              </div>

              {/* End Handle Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>End Marker:</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>
                    {new Date(endTime * 1000).toISOString().substring(11, 19)} ({endTime}s)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3600"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#ff0000' }}
                />
              </div>
            </div>
            {/* Put this inside your {url && ( ... )} wrapper right above the download button */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>
                Add Optional Note (Replaces text on hover):
              </label>
              <input
                type="text"
                placeholder="Type a quick note or reference anchor..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '4px', border: 'none', background: '#3a3a3a', color: '#fff' }}
              />
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
          {savedVideos.filter(v => v.category === activeTab).slice().reverse().map(video => (
            <div key={video.id} style={{ background: '#1c1c1c', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Native HTML5 video component streaming from backend public asset folder */}
              <video
                src={video.videoPath}
                controls
                poster={video.thumbnailPath}
                style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}
              />

              {/* Info Container with Text-Only Hover, Keeping Icon Separate */}
              <div
                style={{ padding: '12px', minHeight: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
              >
                {/* Content Area: Swaps text safely */}
                <div style={{ flexGrow: 1, marginBottom: '8px' }}>
                  {hoveredVideoId === video.id && video.note ? (
                    /* Hover Active View: Shows ONLY the custom note text */
                    <div style={{ color: '#ffc107', fontSize: '14px', lineHeight: '1.4', fontWeight: '500', fontStyle: 'italic' }}>
                      📝 {video.note}
                    </div>
                  ) : (
                    /* Default Steady State View: Shows Title & Window */
                    <>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', lineHeight: '1.4', color: '#fff' }}>
                        {video.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#aaa', fontWeight: '500' }}>
                        Clip: ({formatTimeDisplay(video.clips[0].start)} - {formatTimeDisplay(video.clips[0].end)})
                      </p>
                    </>
                  )}
                </div>

                {/* Control Footer: Outside the text toggle layout, always clickable */}
                {video.url && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', fontSize: '16px', cursor: 'pointer' }}
                      title="Open YouTube source"
                    >
                      🔺📺
                    </a>
                  </div>
                )}
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
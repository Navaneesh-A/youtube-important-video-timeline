import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

export default function VideoLogger() {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);

  const handleSave = async () => {
    // Send the URL and selected cuts to your Node.js backend
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, startTime, endTime })
    });
    
    // Server-Sent Events (SSE) or WebSockets can be hooked here to update `progress`
  };

  return (
    <div className="video-setup-container">
      <input 
        type="text" 
        placeholder="Paste YouTube Link" 
        onChange={(e) => setUrl(e.target.value)} 
      />
      
      {url && (
        <div className="preview-pane">
          <ReactPlayer ref={playerRef} url={url} controls width="100%" />
          
          <div className="time-controls">
            <button onClick={() => setStartTime(Math.floor(playerRef.current.getCurrentTime()))}>
              Set Start: {startTime}s
            </button>
            <button onClick={() => setEndTime(Math.floor(playerRef.current.getCurrentTime()))}>
              Set End: {endTime}s
            </button>
          </div>
          
          <button onClick={handleSave}>Cut & Save Offline</button>
          {progress > 0 && <progress value={progress} max="100" />}
        </div>
      )}
    </div>
  );
}
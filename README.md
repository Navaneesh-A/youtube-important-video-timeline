# run using pm2

pm2 restart ecosystem.config.js --only react-frontend

# ecosystem.config.js
name: "react-frontend",
      // Point directly to the vite binary in node_modules


# youtube-important-video-timeline
only saving important parts in a video and not full
📺 Workspace Vault Studio (YouTube Timestamp Saver)
A personal, offline-first YouTube clip organizer. Paste a lecture link, preview it live, select specific start/end timestamps, and download just that segment directly to your local computer for 100% offline access. Group your saved clips into customizable matrices like Technology, Motivation, and Internships.

🚀 How It Works
Live Feed: Pasting a YouTube link streams a lightweight preview player via Vite.

Precision Clipping: Select precise window limits (Start and End in seconds).

Optimized Extraction: The Node.js server spawns yt-dlp paired with ffmpeg to extract and download only that timestamp window.

Offline Streaming: Clips are served locally from backend/public/ using native HTML5 streaming organized by customizable category cards.

🛠️ Installation & Setup
Prerequisites
Make sure you have Node.js installed, along with yt-dlp and ffmpeg configured on your system's global environment variables.

1. Backend Configuration
PowerShell
# Navigate to the backend workspace
cd backend
# Install production dependencies
npm install

# Start the Node engine server
node server.js
The backend cluster will initialize safely on Port 5001 to avoid existing development conflicts.

2. Frontend Configuration
Open a second, separate terminal instance and execute:

PowerShell
# Navigate to the frontend workspace
cd frontend

# Install client packages
npm install

# Boot up the Vite developer environment
npm run dev
💻 How to Run and Test
Ensure both terminals remain running concurrently.

Open your web browser and navigate to the local Vite interface address:

Plaintext
http://localhost:5173
Paste an target lecture URL, select your crop frames, and click Cut & Download Segment Offline. Watch your interactive progress bar track the extraction process in real time!

📂 Project Architecture Layout
Plaintext
YOUTUBE-IMPORTANT-VIDEO-.../
├── backend/
│   ├── public/
│   │   ├── thumbnails/     <-- Extracted local image covers
│   │   └── videos/         <-- Stored cut .mp4 clips
│   ├── server.js           <-- Node.js Express & SSE Stream core
│   └── videos.json         <-- Metadata JSON document database
└── frontend/
    ├── src/
    │   ├── App.jsx         <-- Dynamic Dashboard & Card Grid
    │   └── main.jsx
    └── vite.config.js      <-- Configured port 5001 reverse proxy
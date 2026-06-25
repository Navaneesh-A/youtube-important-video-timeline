const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

// Serve your downloaded videos and thumbnails statically
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));
app.use('/thumbnails', express.static(path.join(__dirname, 'public/thumbnails')));

// 1. Endpoint to send metadata to frontend grid
app.get('/api/videos-metadata', (req, res) => {
  const jsonPath = path.join(__dirname, 'videos.json');
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify({ categories: ["Motivation", "Technology", "Future Scope", "Intern"], videos: [] }));
  }
  const data = fs.readFileSync(jsonPath, 'utf8');
  res.json(JSON.parse(data));
});

// 2. SSE Live Download and Trim Progress Endpoint
app.get('/api/download-progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { url, startTime, endTime, category } = req.query;

  const videoId = Date.now();
  const videoFileName = `vid_${videoId}.mp4`;
  const outputPath = path.join(__dirname, 'public/videos', videoFileName);

  // Command to download only the specified chunk using yt-dlp + ffmpeg
  // Change 'yt-dlp' to the exact absolute path where you saved it
  const ytdlp = spawn('C:\\Users\\Admin\\Desktop\\ytdownload\\yt-dlp.exe', [
    url,
    '--ffmpeg-location', 'C:\\Users\\Admin\\Desktop\\ytdownload',
    '--download-sections', `*${startTime}-${endTime}`,
    '-o', outputPath,
    '-f', 'mp4'
  ]);

  // CRITICAL: Catch process launch errors so the server doesn't crash
  ytdlp.on('error', (err) => {
    console.error("Failed to start yt-dlp process:", err);
    res.write(`data: ${JSON.stringify({ error: 'System configuration error with download tools.' })}\n\n`);
    res.end();
  });
  // "C:\Users\Admin\Downloads\yt download\ffmpeg-8.1.2.tar.xz"
  ytdlp.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/(\d+\.\d+)%/);
    if (match) {
      res.write(`data: ${JSON.stringify({ progress: match[1] })}\n\n`);
    }
  });

  ytdlp.on('close', (code) => {
    if (code === 0) {
      // Update videos.json database on successful download
      const jsonPath = path.join(__dirname, 'videos.json');
      const db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      db.videos.push({
        id: videoId,
        title: `Lecture Clip (${startTime}s - ${endTime}s)`,
        category: category || "Technology",
        videoPath: `/videos/${videoFileName}`,
        thumbnailPath: "", // Can extend later to fetch real thumbnails
        clips: [{ label: "Saved Segment", start: startTime, end: endTime }]
      });

      fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2));
      res.write(`data: ${JSON.stringify({ status: 'complete' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'yt-dlp execution failed' })}\n\n`);
    }
    res.end();
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend cluster live on port ${PORT}`);
});
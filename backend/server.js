const express = require('express');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');

const corsOptions = {
  origin: '*', // Allows connections from any device on your Wi-Fi network
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0'; // Binds to all local network interfaces
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
  const ytdlpPath = 'C:\\Users\\Admin\\Desktop\\ytdownload\\yt-dlp.exe';

  let videoTitle = `Lecture Clip (${startTime}s - ${endTime}s)`;
  let videoThumbnail = '';

  setStatusMessage('Fetching live video metadata details...');

  // Step A: Extract live Title and Thumbnail URL asynchronously from YouTube
  execFile(ytdlpPath, [url, '--dump-json'], (error, stdout) => {
    if (!error && stdout) {
      try {
        const metadata = JSON.parse(stdout);
        videoTitle = metadata.title || videoTitle;
        videoThumbnail = metadata.thumbnail || '';
      } catch (e) {
        console.error("Failed to parse metadata JSON stream:", e);
      }
    }

    // Step B: Proceed to download section segments
    startDownloadPipeline();
  });

  function setStatusMessage(msg) {
    res.write(`data: ${JSON.stringify({ progress: '0', status: msg })}\n\n`);
  }

  function startDownloadPipeline() {
    const ytdlp = spawn(ytdlpPath, [
      url,
      '--ffmpeg-location', 'C:\\Users\\Admin\\Desktop\\ytdownload',
      '--download-sections', `*${startTime}-${endTime}`,
      '-o', outputPath,
      '-f', 'mp4'
    ]);

    ytdlp.on('error', (err) => {
      console.error("Failed to start yt-dlp process:", err);
      res.write(`data: ${JSON.stringify({ error: 'System configuration error with download tools.' })}\n\n`);
      res.end();
    });

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      const match = output.match(/(\d+\.\d+)%/);
      if (match) {
        res.write(`data: ${JSON.stringify({ progress: match[1] })}\n\n`);
      }
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        const jsonPath = path.join(__dirname, 'videos.json');
        const db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        db.videos.push({
          id: videoId,
          title: videoTitle,
          category: category || "Technology",
          note: req.query.note || "",
          videoPath: `/videos/${videoFileName}`,
          thumbnailPath: videoThumbnail, // Saves direct cover thumbnail link
          url: url, // Passed to frontend link icon routing
          clips: [{ label: "Saved Segment", start: startTime, end: endTime }]
        });

        fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2));
        res.write(`data: ${JSON.stringify({ status: 'complete' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: 'yt-dlp execution failed' })}\n\n`);
      }
      res.end();
    });
  }
});
// 3. New Endpoint to persist dynamically created categories
app.post('/api/add-category', (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Category string required' });

  const jsonPath = path.join(__dirname, 'videos.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (!db.categories.includes(category)) {
        db.categories.push(category);
        fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2), 'utf8');
      }
      return res.json({ success: true, categories: db.categories });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to rewrite database array file.' });
    }
  }
  res.status(404).json({ error: 'Database resource target structural configuration missing.' });
});
// const runRobustAutomation = async (page, targetUrl) => {
//   // Pattern: Trigger navigation and DOM element detection simultaneously
//   await Promise.all([
//     page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }),
//     page.waitForNavigation({ waitUntil: 'load' })
//   ]);

//   // Target specific elements securely before pulling metadata metrics
//   await page.waitForSelector('.video-stream', { visible: true, timeout: 5000 });

//   // Safe to extract data now without execution context drops
//   const title = await page.evaluate(() => document.title);
//   return title;
// };
app.listen(PORT, HOST, () => {
  console.log(`Backend cluster live on Http://${HOST}:${PORT}`);
});
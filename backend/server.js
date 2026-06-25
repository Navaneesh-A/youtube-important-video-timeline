const express = require('express');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const app = express();
const PORT = process.argv[2] || 5001;

app.listen(PORT, () => {
  console.log(`Backend server running safely on port ${PORT}`);
});
// Inside your express endpoint:
app.post('/api/download', async (req, res) => {
  const { url, startTime, endTime } = req.body;
  const videoId = Date.now(); // Simple unique ID
  const outputPath = path.join(__dirname, `public/videos/${videoId}.mp4`);

  try {
    await youtubedl(url, {
      // High-efficiency flags: Tells ffmpeg to download only the specified time frame
      externalDownloader: 'ffmpeg',
      externalDownloaderArgs: `ffmpeg_i:-ss ${startTime} -to ${endTime}`,
      output: outputPath,
      format: 'mp4'
    });

    // Append metadata to your local videos.json file here...
    res.status(200).json({ success: true, id: videoId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Download failed');
  }
});
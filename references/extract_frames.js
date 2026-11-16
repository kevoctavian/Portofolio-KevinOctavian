const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {
  const filePath = path.join('D:/PORTOFOLIO/kevin-portfolio-2026/references', decodeURIComponent(req.url.slice(1)));
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8099, async () => {
  try {
    const browser = await chromium.launch({ channel: 'msedge' });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin:0; background:black; display:flex; justify-content:center; align-items:center; height:100vh;">
          <video id="v" src="http://localhost:8099/portofolioreferences.mp4" controls autoplay muted style="max-width:100%; max-height:100vh;"></video>
        </body>
      </html>
    `);

    await page.waitForTimeout(1500);

    const info = await page.evaluate(async () => {
      const v = document.getElementById('v');
      return { duration: v.duration, videoWidth: v.videoWidth, videoHeight: v.videoHeight };
    });
    console.log('Video info:', info);

    const framesDir = 'D:/PORTOFOLIO/kevin-portfolio-2026/references/frames';
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    const timestamps = [0.5, 2, 4, 6, 8, 11, 14, 18];
    for (let i = 0; i < timestamps.length; i++) {
      const t = timestamps[i];
      if (t >= info.duration) continue;
      await page.evaluate((time) => {
        const v = document.getElementById('v');
        v.currentTime = time;
      }, t);
      await page.waitForTimeout(700);
      const framePath = path.join(framesDir, `frame_${i}_t${t}s.png`);
      await page.screenshot({ path: framePath });
      console.log(`Saved frame ${i} at ${t}s`);
    }

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    server.close();
  }
});

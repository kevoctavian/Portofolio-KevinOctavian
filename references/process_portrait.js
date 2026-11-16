const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const rawBuf = fs.readFileSync('D:/PORTOFOLIO/portfolio-site/images/Profile/KevinCutout.webp');
  const b64 = rawBuf.toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:transparent;">
        <img id="src" src="data:image/webp;base64,${b64}" />
        <canvas id="c"></canvas>
      </body>
    </html>
  `);

  await page.waitForFunction(() => {
    const img = document.getElementById('src');
    return img && img.complete && img.naturalWidth > 0;
  });

  const res = await page.evaluate(() => {
    const img = document.getElementById('src');
    const canvas = document.getElementById('c');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      gray = ((gray / 255 - 0.5) * 1.15 + 0.5) * 255;
      gray = Math.max(0, Math.min(255, gray));

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    ctx.putImageData(imgData, 0, 0);
    return {
      pngDataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };
  });

  const base64Data = res.pngDataUrl.replace(/^data:image\/png;base64,/, '');
  const outPng = 'D:/PORTOFOLIO/kevin-portfolio-2026/assets/images/profile/kevin-portrait.png';
  fs.writeFileSync(outPng, Buffer.from(base64Data, 'base64'));
  console.log(`Saved monochrome cutout to ${outPng} (${res.width}x${res.height})`);

  // JPG version with off-white background
  const jpgRes = await page.evaluate(() => {
    const img = document.getElementById('src');
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F5F5F3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      let gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      gray = ((gray / 255 - 0.5) * 1.15 + 0.5) * 255;
      gray = Math.max(0, Math.min(255, gray));
      data[i] = gray;
      data[i+1] = gray;
      data[i+2] = gray;
    }
    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.95);
  });

  const jpgBase64 = jpgRes.replace(/^data:image\/jpeg;base64,/, '');
  const outJpg = 'D:/PORTOFOLIO/kevin-portfolio-2026/assets/images/profile/kevin-portrait.jpg';
  fs.writeFileSync(outJpg, Buffer.from(jpgBase64, 'base64'));
  console.log(`Saved JPG portrait to ${outJpg}`);

  await browser.close();
})();

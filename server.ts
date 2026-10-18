import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a high limit for Base64 image payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
const SITE_IMAGES_FILE = path.join(DATA_DIR, 'site-images.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// Ensure data storage and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded assets statically in both dev and production
app.use('/uploads', express.static(UPLOADS_DIR));
const distUploads = path.resolve(__dirname, 'dist', 'uploads');
if (fs.existsSync(distUploads)) {
  app.use('/uploads', express.static(distUploads));
}

const readJsonFile = <T>(file: string, fallback: T): T => {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`[Server] Error reading ${file}:`, err);
  }
  return fallback;
};

const writeJsonFile = (file: string, data: any): boolean => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[Server] Error writing ${file}:`, err);
    return false;
  }
};

// Converts Base64 data URLs to permanent static files in public/uploads/
const saveImagePayload = (key: string, urlOrDataUrl: string, originalFilename?: string): string => {
  if (typeof urlOrDataUrl === 'string' && urlOrDataUrl.startsWith('data:')) {
    try {
      const matches = urlOrDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        let ext = 'jpg';
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('svg')) ext = 'svg';
        else if (mimeType.includes('mp4')) ext = 'mp4';
        else if (originalFilename && originalFilename.includes('.')) {
          ext = originalFilename.split('.').pop() || 'jpg';
        }

        const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileBaseName = `${safeKey}_${Date.now()}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileBaseName);
        fs.writeFileSync(filePath, buffer);

        // Also copy to dist/uploads if dist exists
        const distUploadsDir = path.resolve(__dirname, 'dist', 'uploads');
        if (fs.existsSync(distUploadsDir)) {
          try {
            fs.writeFileSync(path.join(distUploadsDir, fileBaseName), buffer);
          } catch (_) {}
        }

        const publicUrl = `/uploads/${fileBaseName}`;
        console.log(`[Server] Converted data URL to static file: ${publicUrl} (${buffer.length} bytes)`);
        return publicUrl;
      }
    } catch (e) {
      console.error('[Server] Failed to write data URL to file:', e);
    }
  }
  return urlOrDataUrl;
};

// ============================================
// API Endpoints for Persistent Site Images
// ============================================

// GET all site images (accessible by all visitors & shared links)
app.get('/api/site-images', (req, res) => {
  const images = readJsonFile<Record<string, string>>(SITE_IMAGES_FILE, {});
  res.json({ success: true, images });
});

// POST to upload an image file directly
app.post('/api/upload-image', (req, res) => {
  try {
    const { key, dataUrl, filename } = req.body;
    if (!key || !dataUrl) {
      return res.status(400).json({ success: false, message: 'Missing key or dataUrl' });
    }
    const publicUrl = saveImagePayload(key, dataUrl, filename);
    const current = readJsonFile<Record<string, string>>(SITE_IMAGES_FILE, {});
    current[key] = publicUrl;
    writeJsonFile(SITE_IMAGES_FILE, current);
    return res.json({ success: true, url: publicUrl, images: current });
  } catch (err: any) {
    console.error('[Server] Failed to handle upload-image:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST to update site images (saved to server disk permanently)
app.post('/api/site-images', (req, res) => {
  try {
    const { images } = req.body;
    if (!images || typeof images !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid images data' });
    }
    const current = readJsonFile<Record<string, string>>(SITE_IMAGES_FILE, {});
    const processedImages: Record<string, string> = {};
    for (const [k, v] of Object.entries(images)) {
      if (typeof v === 'string') {
        processedImages[k] = saveImagePayload(k, v);
      }
    }
    const updated = { ...current, ...processedImages };
    writeJsonFile(SITE_IMAGES_FILE, updated);
    console.log(`[Server] Saved ${Object.keys(updated).length} site images to permanent storage.`);
    return res.json({ success: true, images: updated });
  } catch (err: any) {
    console.error('[Server] Failed to save site images:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST to reset a specific site image or all site images
app.post('/api/site-images/reset', (req, res) => {
  try {
    const { key } = req.body;
    const current = readJsonFile<Record<string, string>>(SITE_IMAGES_FILE, {});
    if (key && current[key]) {
      delete current[key];
      writeJsonFile(SITE_IMAGES_FILE, current);
    } else if (!key) {
      writeJsonFile(SITE_IMAGES_FILE, {});
    }
    return res.json({ success: true, images: current });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// API Endpoints for Customer Inquiries
// ============================================
app.get('/api/inquiries', (req, res) => {
  const inquiries = readJsonFile<any[]>(INQUIRIES_FILE, []);
  res.json({ success: true, inquiries });
});

app.post('/api/inquiries', (req, res) => {
  try {
    const { inquiry } = req.body;
    const inquiries = readJsonFile<any[]>(INQUIRIES_FILE, []);
    if (inquiry) {
      inquiries.unshift(inquiry);
      writeJsonFile(INQUIRIES_FILE, inquiries);
    }
    return res.json({ success: true, inquiries });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// Server Initialization (Vite dev or Static prod)
// ============================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] DroneCleanPro running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();

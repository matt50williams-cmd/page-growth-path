import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Building app...');
  execSync('npm run build', { stdio: 'inherit' });
}

const app = express();
express.static.mime.define({
  'application/javascript': ['js', 'mjs'],
  'text/css': ['css'],
  'image/svg+xml': ['svg'],
  'application/json': ['json'],
});
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  },
}));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on port ' + PORT));

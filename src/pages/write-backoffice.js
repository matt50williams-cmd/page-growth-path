const fs = require('fs');
const code = fs.readFileSync('C:/Users/matt5/Downloads/page-growth-path/src/pages/Backoffice.jsx.bak', 'utf8');
fs.writeFileSync('C:/Users/matt5/Downloads/page-growth-path/src/pages/Backoffice.jsx', code);
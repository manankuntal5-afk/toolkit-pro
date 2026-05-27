const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'src', 'components');
fs.readdirSync(d).filter(x=>x.endsWith('.tsx')).forEach(file => {
  let fp = path.join(d, file);
  let c = fs.readFileSync(fp, 'utf8');
  let nc = c.replace(/onChange=\{\{handleFileUpload\}\}/g, 'onChange={handleFileUpload}');
  
  // also check if we missed the ternary end in others?
  // Let's just fix the double brace first.
  
  if (nc !== c) {
    fs.writeFileSync(fp, nc);
  }
});

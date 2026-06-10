import fs from 'fs';
let content = fs.readFileSync('src/articlesData.ts', 'utf-8');
const regex = /\{\s*"id": "[^"]*",\s*"toolId": "towed-vehicle",[\s\S]*?\},/g;
content = content.replace(regex, '');
fs.writeFileSync('src/articlesData.ts', content, 'utf-8');
console.log('Done cleaning articles');

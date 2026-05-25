const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

async function extractTableData(buffer) {
    const doc = await pdfjs.getDocument({ data: buffer }).promise;
    let allRows = [];
    
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Group items by Y coordinate (row)
        const rowMap = new Map();
        
        for (const item of textContent.items) {
            if (item.str.trim() === '') continue;
            
            // Y is usually transform[5]
            const iterY = Math.round(item.transform[5] / 2) * 2; // group by 2px to handle slight misalignments
            const iterX = item.transform[4];
            
            if (!rowMap.has(iterY)) {
               rowMap.set(iterY, []);
            }
            rowMap.get(iterY).push({ str: item.str, x: iterX });
        }
        
        // Sort Y descending (PDF coordinates usually have 0 at bottom)
        const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);
        
        for (const y of sortedY) {
            const rowItems = rowMap.get(y);
            // Sort X ascending
            rowItems.sort((a, b) => a.x - b.x);
            allRows.push(rowItems.map(item => item.str));
        }
    }
    
    return allRows;
}

module.exports = { extractTableData };

const { PDFExtract } = require('pdf.js-extract');

async function extractTableFromPDFObject(buffer) {
    const pdfExtract = new PDFExtract();
    const data = await new Promise((resolve, reject) => {
        pdfExtract.extractBuffer(buffer, {}, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });

    let allRows = [];

    // Group items by Y across the whole document or by page
    for (const page of data.pages) {
        // Find Y clusters (group strings that are on the same visual line)
        const rowMap = new Map();
        for (const item of page.content) {
            if (!item.str || item.str.trim() === '') continue;
            
            // Cluster by Y (round to nearest 2 pixels to group slight misalignments)
            const iterY = Math.round(item.y / 2) * 2;
            if (!rowMap.has(iterY)) {
                rowMap.set(iterY, []);
            }
            rowMap.get(iterY).push({ str: item.str.trim(), x: item.x, w: item.width || 0 });
        }

        // Sort by Y ascending
        const sortedY = Array.from(rowMap.keys()).sort((a, b) => a - b);
        
        let pageRows = [];
        for (const y of sortedY) {
            const rowItems = rowMap.get(y);
            // sort by X ascending
            rowItems.sort((a, b) => a.x - b.x);
            pageRows.push(rowItems);
        }

        // Now we need to align them into strict columns.
        // What are all the unique X positions on this page?
        const xPositions = new Set();
        for (const row of pageRows) {
            for (const item of row) {
                // Round X to nearest multiple of 5 or 10 to snap to columns
                xPositions.add(Math.round(item.x / 5) * 5);
            }
        }
        
        // Sort X positions to get our column grid
        const columns = Array.from(xPositions).sort((a, b) => a - b);
        
        // Let's filter out columns that are too close to each other (e.g. within 10px)
        const groupedColumns = [];
        for (const col of columns) {
            if (groupedColumns.length === 0) {
                groupedColumns.push(col);
            } else {
                const prev = groupedColumns[groupedColumns.length - 1];
                if (col - prev > 15) { // Minimum 15 points between columns
                    groupedColumns.push(col);
                }
            }
        }

        // Now map each row into these columns
        for (const row of pageRows) {
            // Initialize array of empty strings for this row
            const finalRow = new Array(groupedColumns.length).fill("");
            
            for (const item of row) {
                // Find nearest column
                let bestColIndex = 0;
                let minDiff = Infinity;
                for (let i = 0; i < groupedColumns.length; i++) {
                    const diff = Math.abs(item.x - groupedColumns[i]);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestColIndex = i;
                    }
                }
                
                // If it already has text, append with space
                if (finalRow[bestColIndex] !== "") {
                    finalRow[bestColIndex] += " " + item.str;
                } else {
                    finalRow[bestColIndex] = item.str;
                }
            }
            // Only add if not fully empty
            if (finalRow.some(cell => cell.trim() !== "")) {
                allRows.push(finalRow);
            }
        }
        
        // Add a blank row between pages just for safety if needed
        allRows.push([]);
    }

    return allRows;
}

module.exports = { extractTableFromPDFObject };

const PDFParser = require("pdf2json");

async function parseLocal(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let allRows = [];
            
            for (let p = 0; p < pdfData.Pages.length; p++) {
                const page = pdfData.Pages[p];
                const rowMap = new Map();
                
                for (const text of page.Texts) {
                    if (!text.R || text.R.length === 0) continue;
                    let str = decodeURIComponent(text.R[0].T);
                    if (!str || str.trim() === "") continue;
                    
                    const x = text.x;
                    const y = text.y;
                    
                    // Group vertically (within 0.5 units)
                    const iterY = Math.round(y * 2) / 2;
                    if (!rowMap.has(iterY)) {
                        rowMap.set(iterY, []);
                    }
                    rowMap.get(iterY).push({ str: str.trim(), x: x });
                }
                
                // Sort by Y ascending
                const sortedY = Array.from(rowMap.keys()).sort((a, b) => a - b);
                let pageRows = [];
                for (const y of sortedY) {
                    const rowItems = rowMap.get(y);
                    rowItems.sort((a, b) => a.x - b.x); // sort by X ascending
                    pageRows.push(rowItems);
                }

                // Build unified X grid for columns to align perfectly
                const xPositions = new Set();
                for (const row of pageRows) {
                    for (const item of row) {
                        // Round X to nearest 0.5 units
                        xPositions.add(Math.round(item.x * 2) / 2);
                    }
                }
                
                let columns = Array.from(xPositions).sort((a, b) => a - b);
                
                // Merge columns that are closely spaced
                let groupedColumns = [];
                for (const col of columns) {
                    if (groupedColumns.length === 0) {
                        groupedColumns.push(col);
                    } else {
                        const prev = groupedColumns[groupedColumns.length - 1];
                        if (col - prev > 1.5) { // 1.5 units minimum separation
                            groupedColumns.push(col);
                        }
                    }
                }

                if (groupedColumns.length === 0) groupedColumns = [0];

                for (const row of pageRows) {
                    const finalRow = new Array(groupedColumns.length).fill("");
                    
                    for (const item of row) {
                        let bestColIndex = 0;
                        let minDiff = Infinity;
                        for (let i = 0; i < groupedColumns.length; i++) {
                            const diff = Math.abs(item.x - groupedColumns[i]);
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestColIndex = i;
                            }
                        }
                        
                        if (finalRow[bestColIndex] !== "") {
                            finalRow[bestColIndex] += " " + item.str;
                        } else {
                            finalRow[bestColIndex] = item.str;
                        }
                    }
                    if (finalRow.some(cell => cell.trim() !== "")) {
                        allRows.push(finalRow);
                    }
                }
                allRows.push([]); // spacer between pages
            }
            resolve(allRows);
        });
        
        pdfParser.parseBuffer(buffer);
    });
}
module.exports = { parseLocal };

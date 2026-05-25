import { PDFExtract } from 'pdf.js-extract';
import fs from 'fs';

async function extractTable(buffer) {
    const pdfExtract = new PDFExtract();
    return new Promise((resolve, reject) => {
        pdfExtract.extractBuffer(buffer, {}, (err, data) => {
            if (err) return reject(err);
            
            // data.pages[] has content.
            // Let's see what PDFExtract.utils provides.
            if (data && data.pages) {
                console.log("Pages extracted:", data.pages.length);
            }
            resolve(data);
        });
    });
}

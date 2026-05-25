const PDFParser = require("pdf2json");
const fs = require("fs");

function parsePdfBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve(pdfData);
        });
        pdfParser.parseBuffer(buffer);
    });
}
module.exports = parsePdfBuffer;

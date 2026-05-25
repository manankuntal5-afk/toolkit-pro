const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

async function test() {
    console.log(Object.keys(pdfExtract));
}
test();

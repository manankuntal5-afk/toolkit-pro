const fs = require('fs');

const dataFile = './src/blogData.ts';
let code = fs.readFileSync(dataFile, 'utf8');

const titles = [
  "Digital Footprint", "Common Data", "Chat To PDF", "Geo Map", "Link Scanner",
  "PDF To CSV", "Image Compressor", "QR Checker", "Social Checker", "Photo Meta",
  "WhatsApp Chk", "PDF Redactor", "Image Fixer", "Translator", "Trip Calc", 
  "Clothing Size", "Youtube Recipe", "Towed Vehicle", "Bank Decoder"
];

let i = 0;
// We will replace them with stable placeholder URLs with teal backgrounds
code = code.replace(/image:\s*"https:\/\/picsum\.photos\/seed\/[^"]+"/g, () => {
    const text = encodeURIComponent(titles[i % titles.length]);
    i++;
    return `image: "https://placehold.co/800x450/0eb2a8/white?text=${text}"`;
});

fs.writeFileSync(dataFile, code);
console.log("Updated images.");

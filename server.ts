import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import PDFParser from "pdf2json";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Configure Multer for in-memory file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  function cleanJsonResponse(text: string): string {
    if (!text) return "{}";
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }

  // Helper to get GoogleGenAI client (with optional custom API key override)
  function getAi(req?: express.Request) {
    const customKey = req?.headers['x-gemini-api-key'] as string;
    const apiKeyToUse = customKey || process.env.GEMINI_API_KEY;
    if (!apiKeyToUse) {
      throw new Error("GEMINI_API_KEY environment variable is missing and no custom key provided.");
    }
    return new GoogleGenAI({ apiKey: apiKeyToUse });
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/check-whatsapp", async (req, res) => {
    try {
      const { phone } = req.query;
      if (!phone) return res.json({ hasWa: false });
      
      const p = String(phone).replace(/\D/g, '');
      if (p.length !== 10) return res.json({ hasWa: false });
      
      // WhatsApp API requires authentication. We use heuristics to detect obvious fake/invalid numbers
      // that users typically use for testing (e.g. 9999999999, 1234567890).
      
      // 1. Must start with 6, 7, 8, or 9 (Indian numbers)
      if (!['6', '7', '8', '9'].includes(p[0])) {
         return res.json({ hasWa: false });
      }

      // 2. Check for 5 or more repeating digits (e.g. 9999999999, 9888888989)
      if (/(.)\1{5,}/.test(p)) {
         return res.json({ hasWa: false });
      }

      // 3. Check for obvious sequences
      if (p === '1234567890' || p === '0987654321' || p.includes('123456') || p.includes('654321') || p === '9876543210') {
         return res.json({ hasWa: false });
      }

      // If it passes all heuristics, we consider it a valid active number and likely on WhatsApp
      return res.json({ hasWa: true });
    } catch (err) {
      console.error("WA Check Error:", err);
      return res.json({ hasWa: false });
    }
  });

  // Tool 4: Safe link & Phishing website scanner
  app.post("/api/check-phishing", async (req, res) => {
    try {
      const { url } = req.body;
      const prompt = `Perform a comprehensive OSINT and safety analysis on this URL: ${url}.`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              score: { type: "INTEGER", description: "Safety score from 0 to 100" },
              isSafe: { type: "BOOLEAN" },
              explanation: { type: "STRING", description: "Detailed explanation of why it is safe or unsafe" },
              publicData: { 
                type: "OBJECT", 
                description: "Detailed OSINT information about the domain/URL",
                properties: {
                  "Domain Name": { type: "STRING" },
                  "Domain Age": { type: "STRING" },
                  "Registrar": { type: "STRING" },
                  "Server Location": { type: "STRING" },
                  "Hosting Provider": { type: "STRING" },
                  "SSL Status": { type: "STRING" },
                  "Popularity / Rank": { type: "STRING" },
                  "Known Threats": { type: "STRING" },
                  "Malware Reports": { type: "STRING" },
                  "Phishing Status": { type: "STRING" }
                }
              }
            },
            required: ["score", "isSafe", "explanation", "publicData"]
          }
        }
      });
      
      const text = response.text || "{}";
      res.json(JSON.parse(cleanJsonResponse(text)));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tool 7: Fake Social Media Checker
  app.post("/api/check-fake-social", async (req, res) => {
    try {
      const { platform, url } = req.body;
      
      // Attempt to quickly fetch the URL to extract meta tags for realtime data & profile image
      let metaDataStr = "";
      let profileImageUrl = "";
      try {
         const fetchRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }, signal: AbortSignal.timeout(3000) });
         const html = await fetchRes.text();
         
         const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
         if (ogImageMatch) profileImageUrl = ogImageMatch[1];
         
         const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
         const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
         
         if (ogTitleMatch) metaDataStr += `\nTitle Meta: ${ogTitleMatch[1]}`;
         if (ogDescMatch) metaDataStr += `\nDesc Meta: ${ogDescMatch[1]}`;
      } catch (e) {
         // Ignore fetch errors to keep it fast
      }
      
      const prompt = `Analyze this social media profile URL: ${url} for platform: ${platform}. 
      Here is some public metadata extracted directly from the webpage: ${metaDataStr || 'None. Make best estimations based on URL format.'}
      
      Using this data and pattern recognition, quickly estimate if this profile looks fake or suspicious. 
      Provide a JSON response with the following keys:
      - "isFake" (boolean)
      - "username" (string)
      - "profileName" (string)
      - "creationDate" (string)
      - "followers" (string)
      - "activity" (string)
      - "birthDate" (string, if available or "Not public")
      - "mobileNumber" (string, if available or "Not public")
      - "location" (string, inferred location if available)
      - "bio" (string, inferred bio or summary)
      - "otherData" (string, any other public OSINT data)
      - "explanation" (A very simple and easy to understand explanation in English about why it is real or fake).
      Return ONLY valid JSON. Keep analysis fast and concise.`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text || "{}";
      const resultObj = JSON.parse(text);
      if (profileImageUrl) {
        resultObj.profileImageUrl = profileImageUrl;
      } else {
        resultObj.profileImageUrl = `https://unavatar.io/${resultObj.username || 'unknown'}`;
      }
      
      res.json(resultObj);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tool 10: PDF parser
  app.post("/api/parse-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
      const textData = await parser.getText();
      const numPages = (await parser.getInfo()).total;
      
      res.json({ text: textData.text || "", numPages });
    } catch (error: any) {
      console.error("PDF parse error:", error);
      res.status(500).json({ error: error.message || "Failed to parse PDF" });
    }
  });

  app.post("/api/extract-table-file", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const allRows = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            let extractedRows: string[][] = [];
            
            for (let p = 0; p < pdfData.Pages.length; p++) {
                const page = pdfData.Pages[p];
                const rowMap = new Map();
                
                for (const text of page.Texts) {
                    if (!text.R || text.R.length === 0) continue;
                    let str = decodeURIComponent(text.R[0].T);
                    if (!str || str.trim() === "") continue;
                    
                    const x = text.x;
                    const y = text.y;
                    
                    // Group vertically (within 0.5 units) to account for tiny layout shifts
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
                const xPositions = new Set<number>();
                for (const row of pageRows) {
                    for (const item of row) {
                        // Round X to 1 decimal place to capture tight columns
                        xPositions.add(Math.round(item.x * 10) / 10);
                    }
                }
                
                let columns = Array.from(xPositions).sort((a: number, b: number) => a - b);
                
                // Merge columns that are closely spaced
                let groupedColumns: number[] = [];
                for (const col of columns) {
                    if (groupedColumns.length === 0) {
                        groupedColumns.push(col);
                    } else {
                        const prev = groupedColumns[groupedColumns.length - 1];
                        if (col - prev > 0.4) { // 0.4 units minimum separation avoids merging distinct columns
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
                        extractedRows.push(finalRow);
                    }
                }
                extractedRows.push([]); // spacer between pages
            }
            resolve(extractedRows);
        });
        
        pdfParser.parseBuffer(req.file.buffer);
      });

      if ((allRows as any[]).length === 0) {
         return res.json({ table: [["Message"], ["No structured data found in the document"]] });
      }

      return res.json({ table: allRows });
    } catch (error: any) {
      console.error("PDF table extraction error:", error);
      res.status(500).json({ error: error.message || "Failed to extract table" });
    }
  });

  // Tool 10: AI Chat on PDF text
  app.post("/api/chat-pdf", async (req, res) => {
    try {
      const { text, question } = req.body;
      const prompt = `Here is extracted text from a PDF file:\n\n${text.substring(0, 50000)}\n\nBased ONLY on the text above, answer the following question in easy English: ${question}`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });
      
      res.json({ answer: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Extract table from PDF text
  app.post("/api/extract-table-pdf", async (req, res) => {
    try {
      const { text } = req.body;
      const prompt = `Extract all tabular data, lists, or structured records from this text into a single cohesive table format. Return the response strictly as a JSON array of arrays of strings (e.g., [["Name", "Age"], ["Alice", "25"]]). If there is no tabular data, try to structure the most important facts as a table. If absolutely no structure is possible, return [["Message"], ["No structured data found in the document"]].\n\nText:\n${text.substring(0, 50000)}`;

      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const responseText = response.text || "[]";
      res.json({ table: JSON.parse(cleanJsonResponse(responseText)) });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tool 6: QR OSINT check
  app.post("/api/check-qr", async (req, res) => {
    try {
      const { qrText } = req.body;
      const prompt = `Analyze this QR code text (often UPI or URL): ${qrText}. If it is a UPI URI, extract the payee name, bank name (if possible from VPA), and indicate safety. Provide a JSON response with: "isSafe" (boolean), "payeeName" (string), "bankDetails" (string), "upiId" (string), "explanation" (detail in easy English). Return ONLY JSON.`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text || "{}";
      res.json(JSON.parse(cleanJsonResponse(text)));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto extract Chat metadata
  app.post("/api/extract-chat-metadata", async (req, res) => {
    try {
      const { textContent, imagesBase64 } = req.body;
      
      let contents: any[] = [];
      const promptText = `You are an expert OCR and data extraction system similar to Google Lens. Analyze the provided chat screenshots or text.
      
      Extract all distinct names, phone numbers, and dates found anywhere in the images or text. Do not firmly assign them to sender or receiver yet, just provide a list of what you found.
      Also extract ALL visible chat messages chronologically.
      For each message, try to determine if it is the sender or receiver based on alignment (LEFT = Receiver/Other Person, RIGHT = Sender/Me).
      
      Provide a JSON response strictly containing the following keys:
      - "foundNames": An array of strings containing all unique names found.
      - "foundNumbers": An array of strings containing all unique phone numbers or user IDs found.
      - "foundDates": An array of strings containing all unique dates/times found (e.g. Chat header dates).
      - "messages": An array of objects: {"sender": "string (try to put the name or 'Sender (You)' / 'Receiver (Them)')", "time": "hh:mm AM/PM", "text": "message text"}.
        
      DO NOT return any markdown formatting, ONLY return valid JSON.`;

      contents.push(promptText);

      if (imagesBase64 && Array.isArray(imagesBase64) && imagesBase64.length > 0) {
        imagesBase64.forEach((imageBase64) => {
           const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
           const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
           const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
           contents.push({
             inlineData: {
               data: base64Data,
               mimeType: mimeType
             }
           });
        });
      }

      if (textContent) {
         contents.push("\ntranscript text:\n" + textContent.substring(0, 50000));
      }

      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: contents,
        config: { responseMimeType: "application/json" }
      });
      
      const responseText = response.text || "{}";
      res.json(JSON.parse(cleanJsonResponse(responseText)));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tool: Brand Size Converter
  app.post("/api/brand-size", async (req, res) => {
    try {
      const { category, currentBrand, currentSize, targetBrand } = req.body;
      const prompt = `You are a fashion sizing expert. The user wears size "${currentSize}" in "${currentBrand}" for the category "${category}". They want to buy from "${targetBrand}". What size should they get in "${targetBrand}"? 
      Return ONLY a JSON object with: 
      "recommendedSize" (strictly the size value, e.g. "M", "9", "32"), 
      "explanation" (A short, friendly explanation in very simple, easy-to-understand English).`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(cleanJsonResponse(response.text || "{}")));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tool: YouTube Recipe Extractor
  app.post("/api/youtube-recipe", async (req, res) => {
    try {
      const { url, language } = req.body;
      const langText = language || "English";
      const prompt = `You are an AI culinary assistant. Your task is to extract a recipe and grocery list from a YouTube video link: ${url}.
      Instructions:
      1. Auto-detect the language of the video.
      2. Extract the complete list of grocery items/ingredients needed to make the recipe.
      3. For each item, provide its name in ${langText}.
      4. Estimate the market price in INR as an integer number (e.g. 50, 100). Do not include ₹ symbol.
      
      Respond ONLY with a valid JSON object matching this exact structure:
      {
        "recipeName": "name of the recipe",
        "ingredients": [
          {
            "item": "grocery item name in ${langText}",
            "quantity": "amount needed",
            "estimatedPrice": 50
        }
      ]
    }`;
    
    let response;
    let retries = 3;
    while (retries > 0) {
      try {
        response = await getAi(req).models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: { 
            tools: [{ googleSearch: {} }]
          }
        });
        break; // success
      } catch (err: any) {
        retries--;
        console.error(`Gemini API Error details: ${err.message}. Retries left: ${retries}`);
        if (retries === 0 || !(err.message && (err.message.includes("503") || err.message.includes("high demand") || err.message.includes("UNAVAILABLE")))) {
          throw err;
        }
        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds before retry
      }
    }
    
    res.json(JSON.parse(cleanJsonResponse(response?.text || "{}")));
    } catch (error: any) {
      console.error("YouTube Recipe Error:", error);
      let errorMessage = error.message || "Failed to process YouTube recipe";
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
         errorMessage = "The AI service is currently experiencing high demand. Please try again in a moment.";
      } else if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
         errorMessage = "The AI service has reached its usage limit (quota exceeded). Please try again later or provide a custom API key if supported.";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Tool: Digital Footprint Scanner
  app.post("/api/digital-footprint", async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      const prompt = `You are an OSINT investigator. Perform a simulated public digital footprint scan for the following details: Name: ${name}, Email: ${email}, Phone: ${phone}.
      Since you cannot do real-time deep web hacking, use Google Search to find if these details appear on public websites, forums, or directories. 
      IMPORTANT INSTRUCTION: Extract EVERY SINGLE PIECE OF DATA YOU FIND, exhaustively. Do not omit anything. Provide as many findings as possible, as large as the data allows. Ensure to provide an exhaustive list of all identified mentions, links, and public profiles. If no real data is found, simulate a very detailed, exhaustive realistic report of what platforms typically hold data for similar profiles.
      Return a JSON response with:
      "findings" (array of objects with "platform" (string), "dataType" (string), "riskLevel" (High/Medium/Low, string), "description" (string in clear, easy-to-understand English)),
      "summary" (string in clear, easy-to-understand English summarizing the footprint visibility).
      
      Respond ONLY with a valid JSON object.`;
      
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await getAi(req).models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: { 
              tools: [{ googleSearch: {} }]
            }
          });
          break;
        } catch (err: any) {
          retries--;
          console.error(`Gemini API Error details: ${err.message}. Retries left: ${retries}`);
          if (retries === 0 || !(err.message && (err.message.includes("503") || err.message.includes("high demand") || err.message.includes("UNAVAILABLE")))) {
            throw err;
          }
          await new Promise(res => setTimeout(res, 2000));
        }
      }

      res.json(JSON.parse(cleanJsonResponse(response?.text || "{}")));
    } catch (error: any) {
      console.error("Digital Footprint Error:", error);
      let errorMessage = error.message || "Failed to process digital footprint scan";
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
         errorMessage = "The AI service is currently experiencing high demand. Please try again in a moment.";
      } else if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
         errorMessage = "The AI service has reached its usage limit (quota exceeded). Please try again later or provide a custom API key if supported.";
      } else if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
         errorMessage = "Internal system error parsing data. Try scanning again.";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Tool: Bank Remarks Decoder
  app.post("/api/decode-bank", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      let text = "";
      if (req.file.mimetype === "application/pdf") {
         const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
         text = (await parser.getText()).text;
      } else {
         text = req.file.buffer.toString('utf8'); // assuming CSV/TXT if not PDF
      }
      
      const prompt = `You are a financial expert. Analyze the following bank statement text and find the complex banking remarks/narrations (like WDL, UPI routing codes, ACH, NEFT/RTGS codes, hash strings, CBDC etc.).
      Decode them into normal, understandable, easy English language so the user knows exactly where the transaction went or came from.
      Text: ${text.substring(0, 30000)}
      
      Return a JSON response with:
      "transactions" (array of objects with "originalRemark" (string), "date" (string if found), "amount" (string if found), "decodedMeaning" (string in clear, easy-to-understand English, explaining the transaction simply)).`;
      
      const response = await getAi(req).models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(cleanJsonResponse(response.text || "{}")));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tool: Document Translator
  app.post("/api/translate-doc", upload.single("file"), async (req, res) => {
    try {
      const { sourceLang, targetLang } = req.body;
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      let contents: any[] = [];
      const prompt = `You are an expert layout-preserving document translator. Translate the document from ${sourceLang} to ${targetLang} exactly as it appears.
      CRITICAL: Output ONLY the translated text in ${targetLang}. DO NOT include the original ${sourceLang} text side-by-side or above/below. Completely replace all original text with its translated equivalent.
      Return the translated text maintaining the exact paragraph structure, table structure, alignments, and heading levels.
      If you see any stamps, seals, or signatures, CREATE AN HTML VISUAL PLACEHOLDER for them in the exact same location (e.g. <div style="border: 2px dashed red; color: red; padding: 10px; display: inline-block; transform: rotate(-10deg); font-weight: bold;">[STAMP/SEAL: Translated Text]</div>).
      Provide ONLY valid HTML output (do not include markdown ticks like \`\`\`html) that represents the full document structure, including <table>, <h1>, <p>, etc., styled inline to look formal, organized, and identical to the original document.`;
      
      contents.push(prompt);
      
      if (req.file.mimetype === "application/pdf") {
         // for PDF, we extract text first to save tokens or if Gemini supports pdf inline we pass it
         contents.push({
           inlineData: {
             data: req.file.buffer.toString('base64'),
             mimeType: "application/pdf"
           }
         });
      } else if (req.file.mimetype.startsWith("image/")) {
         contents.push({
           inlineData: {
             data: req.file.buffer.toString('base64'),
             mimeType: req.file.mimetype
           }
         });
      } else {
         contents.push(req.file.buffer.toString('utf8'));
      }
      
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await getAi(req).models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: contents
          });
          break;
        } catch (err: any) {
          if (err.status === "UNAVAILABLE" || err.status === 503 || err.message?.includes("503") || err.message?.includes("high demand") || err.message?.includes("temporarily overloaded")) {
            retries--;
            if (retries === 0) throw new Error("The AI model is currently experiencing high demand and is unavailable. Please try again in a few minutes.");
            console.log("Model unavailable, retrying in 3 seconds...");
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            throw err;
          }
        }
      }
      
      res.json({ translation: response?.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/redact-doc", upload.single("file"), async (req, res) => {
    try {
      const { docLang, word, actionType, scope } = req.body;
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      let contents: any[] = [];
      
      const redactionStyle = actionType === 'blur' ? 'filter: blur(4px); background-color: #e2e8f0; color: transparent;' : 'background-color: black; color: black;';
      
      const prompt = `You are an expert document layout-preserver and redactor. Read the following document in ${docLang}.
      CRITICAL INSTRUCTION: I want you to completely redact the word, name, or number: "${word}".
      Redaction scope: ${scope === 'first' ? 'ONLY REDACT THE VERY FIRST OCCURRENCE of the word/number, and leave all subsequent occurrences untouched.' : 'REDACT EVERY SINGLE OCCURRENCE of the word/number throughout the entire document.'}
      
      To redact it, you MUST replace the original text with this HTML span: <span style="${redactionStyle}" class="redacted-text">${word}</span>.
      DO NOT leave the original text visible anywhere in the output where it should be redacted. Maintain case-insensitivity when searching for the word to redact.
      
      Return the document text exactly as it appears, maintaining the exact paragraph structure, table structure, alignments, and heading levels.
      If you see any stamps, seals, or signatures, CREATE AN HTML VISUAL PLACEHOLDER for them in the exact same location.
      Provide ONLY valid HTML output (do not include markdown ticks like \`\`\`html) that represents the full document structure, including <table>, <h1>, <p>, etc., styled inline to look formal, organized, and identical to the original document.`;
      
      contents.push(prompt);
      
      if (req.file.mimetype === "application/pdf") {
         contents.push({
           inlineData: {
             data: req.file.buffer.toString('base64'),
             mimeType: "application/pdf"
           }
         });
      } else if (req.file.mimetype.startsWith("image/")) {
         contents.push({
           inlineData: {
             data: req.file.buffer.toString('base64'),
             mimeType: req.file.mimetype
           }
         });
      } else {
         contents.push(req.file.buffer.toString('utf8'));
      }
      
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await getAi(req).models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: contents
          });
          break;
        } catch (err: any) {
          if (err.status === "UNAVAILABLE" || err.status === 503 || err.message?.includes("503") || err.message?.includes("high demand") || err.message?.includes("temporarily overloaded")) {
            retries--;
            if (retries === 0) throw new Error("The AI model is currently experiencing high demand and is unavailable. Please try again in a few minutes.");
            console.log("Model unavailable, retrying in 3 seconds...");
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            throw err;
          }
        }
      }
      
      res.json({ content: response?.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

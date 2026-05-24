import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
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

  let ai: GoogleGenAI | null = null;
  function getAi() {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Tool 4: Safe link & Phishing website scanner
  app.post("/api/check-phishing", async (req, res) => {
    try {
      const { url } = req.body;
      const prompt = `Perform a comprehensive OSINT and safety analysis on this URL: ${url}.`;
      
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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
      
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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

  // Tool 10: AI Chat on PDF text
  app.post("/api/chat-pdf", async (req, res) => {
    try {
      const { text, question } = req.body;
      const prompt = `Here is extracted text from a PDF file:\n\n${text.substring(0, 50000)}\n\nBased ONLY on the text above, answer the following question in easy English: ${question}`;
      
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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
      
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
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

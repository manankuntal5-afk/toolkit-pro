import { GoogleGenAI } from "@google/genai";
async function test() {
  const models = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  for (const model of models) {
     try {
       const response = await ai.models.generateContent({
         model: model,
         contents: "Hi"
       });
       console.log(`${model} OK`);
     } catch (e: any) {
       console.log(`${model} ERROR:`, e.message);
     }
  }
}
test();

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        'What is this document?',
        { inlineData: { data: 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5yqwMjDkSswtyEkEkmZmukBKVUFBQYmVmRkAEoUHSQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjI5CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSAzIDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDQgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzEgMCBSXT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFI+PgplbmRvYmoKCjYgMCBvYmoKPDwvUHJvZHVjZXIoZ2hvc3RzY3JpcHQpL0NyZWF0aW9uRGF0ZShEOjIwMjAwNTA0MTIzNDU2KzAyJzAwJyk+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA5MyAwMDAwMCBuIAowMDAwMDAwMjM1IDAwMDAwIG4gCjAwMDAwMDAzMDMgMDAwMDAgbiAKMDAwMDAwMDM1NCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNy9Sb290IDUgMCBSL0luZm8gNiAwIFI+PgpzdGFydHhyZWYKNDQxCiUlRU9GCg==', mimeType: 'application/pdf' } }
      ]
    });
    console.log(result.text);
  } catch (e) {
    console.error(e);
  }
}
test();

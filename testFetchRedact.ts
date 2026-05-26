import fs from 'fs';

async function testFetch() {
  const formData = new FormData();
  formData.append("docLang", "English");
  formData.append("word", "test");
  formData.append("actionType", "hide");
  formData.append("scope", "all");
  
  fs.writeFileSync("dummy2.txt", "This is a test document with a test word inside.");
  const blob = new Blob([fs.readFileSync("dummy2.txt")], { type: "text/plain" });
  formData.append("file", blob, "dummy2.txt");

  try {
    const res = await fetch("http://localhost:3000/api/redact-doc", {
      method: "POST",
      body: formData as any
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}
testFetch();

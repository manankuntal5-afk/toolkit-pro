fetch('http://localhost:3000/api/check-phishing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://google.com' })
}).then(async r => {
  console.log(r.status);
  console.log(await r.text());
}).catch(console.error);

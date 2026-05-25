import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
  const form = new FormData();
  form.append('file', Buffer.from([0, 1]), { filename: 'test.pdf' });
  const res = await fetch('http://localhost:3000/api/extract-table-file', {
    method: 'POST',
    body: form
  });
  console.log(res.status);
  const data = await res.text();
  console.log(data);
}
test();

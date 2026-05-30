const https = require('https');

https.get('https://meridian-dashboard-2pbi.onrender.com/assets/index-DdRHi78Q.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Headers:", res.headers['content-type']);
    console.log("Snippet:", data.substring(0, 100));
  });
});

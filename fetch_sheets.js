const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1LWJ4IEH7TOXbm5ZwDUSVyJSqnIHg2y5tUM9a64ulW5A/edit', (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
        const matches = [...data.matchAll(/"name":"([^"]+)"/g)];
        console.log(matches.slice(0, 20).map(m => m[1]));
    });
});

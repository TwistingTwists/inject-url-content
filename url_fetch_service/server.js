const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { convert } = require('html-to-text');

const app = express();
const port = 3000;

app.get('/getUrlContent', async (req, res) => {
  const url = req.query.url;
  console.log(url);

  try {
    const response = await fetch(url);
    const data = await response.text();
    const dom = new JSDOM(data);
    const htmlContent = dom.window.document.body.innerHTML;
    const textContent = convert(htmlContent, {
      wordwrap: 130
    });
    res.send(textContent);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`URL fetch service listening at http://localhost:${port}`);
  console.log(`To test this service, you can use the following curl command:`);
  console.log(`curl -G http://localhost:${port}/getUrlContent --data-urlencode "url=http://example.com"`);
});
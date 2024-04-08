const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { convert } = require('html-to-text');
const cors = require('cors');
const NodeCache = require('node-cache');
const myCache = new NodeCache();

const app = express();
const port = 3000;

app.use(cors());

app.get('/getUrlContent', async (req, res) => {
  const url = req.query.url;
  console.log(url);

  try {
    let textContent = myCache.get(url);
    if (textContent == undefined) {
      const response = await fetch(url);
      const data = await response.text();
      const dom = new JSDOM(data);
      const htmlContent = dom.window.document.body.innerHTML;
      textContent = convert(htmlContent, {
        wordwrap: 130
      });
      myCache.set(url, textContent);
    }
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
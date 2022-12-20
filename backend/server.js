const path = require('path')
const express = require('express')
const dotenv = require('dotenv').config()
const cors = require("cors");
const axios = require("axios");
const bodyParser = require('body-parser');
const port = process.env.PORT || 5500;
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const returnData = async (domain) => {
  const rowAds = await axios.get(`https://${domain}/ads.txt`)
  const parseData = {}
  rowAds.data.split('\n').forEach(element => {
      if (element.includes('.')) {
          const domainName = element.split(',')[0]
          if (!domainName.includes('#')) {
              if (Object.keys(parseData).includes(domainName)) {
                  parseData[domainName] += 1
              } else {
                  parseData[domainName] = 1
              }
          }
      }
  });
  return parseData;
}

app.post('/parseData', async (req, res) => {
  try {
      const domain = req.body.domain;
      const readyData = await returnData(domain);
      res.send(readyData);
  } catch (error) {
      res.send("error");
  }
});

app.use(cors());
app.listen(port, ()=> console.log(`Server started on port ${port}`))

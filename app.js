const app = require("express")();
const fetch = require("node-fetch");

const config = {
  port: 3000,
  baseURL: "http://old.reddit.com",
};

app.use("*", function (req, res) {
  console.log(req.get("host"));
  var date = new Date().toISOString().substr(11, 8);
  var url = config.baseURL + req.originalUrl;
  logger(date, req.ip, url);
  fetch(url, {
    method: req.method,
    headers: { "User-Agent": req.headers["user-agent"] },
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => {
        res.send(Buffer.from(buf));
      });
    });
});

function logger(date, ip, url) {
  if (url.length > 60) {
    console.log(`[-] [${date}] ${ip} => ${url.substr(0, 60)}...`);
  } else {
    console.log(`[-] [${date}] ${ip} => ${url}`);
  }
}

module.exports = app;

// app.listen(config.port, () => {
//   console.clear();
//   console.log(`[!] Proxy Started at http://localhost:${config.port}`);
// });

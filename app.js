const app = require("express")();
const fetch = require("node-fetch");

const config = {
  port: 3000,
  baseURL: "https://old.reddit.com",
  host: "f1shproxy",
  otherHost: process.env.VERCEL_URL.split(".")[0].replace(/_/g, "."),
};

app.use("*", function (req, res) {
  const remoteHost =
    req.protocol + "://" + req.get("host").split(".")[0].replace(/_/g, ".");
  let url = config.baseURL;
  if (remoteHost != config.host && remoteHost != config.otherHost) {
    url = remoteHost + req.originalUrl;
  }

  console.log(`[${req.method}] ${url.substr(0, 60)}...`);
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

module.exports = app;

// app.listen(config.port, () => {
//   console.clear();
//   console.log(`[!] Proxy Started at http://localhost:${config.port}`);
// });

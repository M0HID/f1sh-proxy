const l = (p, l) =>
  console.log(`[${p}] ${typeof l === "object" ? JSON.stringify(l) : l}`);

const app = require("express")();
const fetch = require("node-fetch");

app.use(require("cors")());
const base = "https://webtoons.com";

app.use("*", (req, res) => {
  let headers = req.headers;
  headers["origin"] = base;
  headers["referer"] = `${base}/`;
  headers["host"] = "webtoons.com";
  [("host", "origin", "referrer", "referer")].forEach((h) => delete headers[h]); //"origin", "referer",
  console.log(headers);

  console.log(`${base}${req.originalUrl}`);
  fetch(`https://webtoons.com`, {
    // method: req.method,
    // headers,
    // redirect: "follow",
    // follow: 100,
  })
    .then((res) => res.blob())
    .then((body) => {
      [
        "x-frame-options",
        "referrer-policy",
        "referer-policy",
        "x-xss-protection",
      ].map((h) => res.removeHeader(h));
      res.type(body.type);
      body.arrayBuffer().then((buf) => {
        res.send(Buffer.from(buf));
      });
    });
});

module.exports = app;

app.listen(3000, () => {
  console.clear();
  console.log(`[!] Proxy Started at http://localhost:3000`);
});

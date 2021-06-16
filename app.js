const { resolve } = path;
const app = require("express")();
const fetch = require("node-fetch");

const config = {
  port: 3000,
  baseURL: "old.reddit.com",
  host: "f1shproxy",
  otherHost: process.env.VERCEL_URL.split(".")[0].replace(/_/g, "."),
};

app.use(require("cors")());

app.use("*", function (req, res) {
  const remoteHost = req.get("host").split(".")[0].replace(/_/g, ".");
  let url = config.baseURL;

  if (remoteHost == "browser") return res.sendFile(resolve("index.html"));
  else if (remoteHost != config.host && remoteHost != config.otherHost) {
    url = remoteHost + req.originalUrl;
  }

  let headers = req.headers;

  headers["origin"] && delete headers["origin"];
  headers["referer"] && delete headers["referer"];
  headers["host"] && delete headers["host"];

  fetch(`${req.protocol}://${url}`, {
    method: req.method,
    headers,
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => {
        res.send(Buffer.from(buf));
      });
    });

  console.log(`[${req.method}] ${url}`);
});

module.exports = app;

// app.listen(config.port, () => {
//   console.clear();
//   console.log(`[!] Proxy Started at http://localhost:${config.port}`);
// });

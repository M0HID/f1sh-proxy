const { join } = require("path");
const app = require("express")();
const fetch = require("node-fetch");
const rewriteHTML = require("./util/rewriteHTML");
const config = {
  port: 3000,
  host: "f1shproxy",
  rewrite: {
    // default url to send all <>.fp.ml requests to
    default: "browser.f1shproxy.ml",
    // base url
    normal: "f1shproxy.ml",
    // origin rewrite url
    origin: `origin_rewrite.f1shproxy.ml`,
  },
  hosts: {
    base: "f1shproxy",
    vercel: process.env.VERCEL
      ? process.env.VERCEL_URL.split(".")[0].replace(/_/g, ".")
      : "",
  },
};

app.use(require("cors")());

app.use("*", function (req, res) {
  const { rewrite, hosts } = config;
  // apple_com.f1shproxy.ml => apple.com
  const remote = req.get("host").split(".")[0].replace(/_/g, ".");
  let url = rewrite.default;

  if (remote == "browser") return res.sendFile(join(__dirname, "index.html"));
  else if (remote != hosts.base && remote != hosts.vercel)
    url = remote + req.originalUrl;

  let headers = req.headers;
  headers["origin"] && delete headers["origin"];
  headers["referer"] && delete headers["referer"];
  headers["host"] && delete headers["host"];

  process.env.DEBUG && console.log([req.method, url, req.protocol, remote]);

  fetch(`${req.protocol}://${url}`, {
    method: req.method,
    headers,
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);
      console.log(body.type);

      // rewrite html to use our proxy on any urls
      if (body.type == "text/html") {
        body.text().then((html) => res.send(rewriteHTML(html, remote, config)));
      } else {
        body.arrayBuffer().then((buf) => {
          res.send(Buffer.from(buf));
        });
      }
    });
});

module.exports = app;

// app.listen(config.port, () => {
//   console.clear();
//   console.log(`[!] Proxy Started at http://localhost:${config.port}`);
// });

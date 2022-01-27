const l = (p, l) =>
  console.log(`[${p}] ${typeof l === "object" ? JSON.stringify(l) : l}`);

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

app.use("*", (req, res) => {
  const { rewrite, hosts } = config;
  // apple_com.f1shproxy.ml => apple.com
  const remote = req.get("host").split(".")[0].replace(/_/g, ".");
  let url = rewrite.default;

  if (remote == "browser") return res.sendFile(join(__dirname, "index.html"));
  else if (remote == "origin.rewrite") return rewriteOrigin(req, res, remote);
  else if (remote != hosts.base && remote != hosts.vercel)
    url = remote + req.originalUrl;

  let headers = req.headers;
  headers["origin"] && (headers["origin"] = `${req.protocol}://${remote}`);
  headers["referer"] && (headers["referer"] = `${req.protocol}://${url}`);
  headers["host"] && delete headers["host"];

  process.env.DEBUG && console.log([req.method, url, req.protocol, remote]);

  fetch(`${req.protocol}://${url}`, {
    method: req.method,
    headers,
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);
      console.log(url, body.type);

      // rewrite html to use our proxy on any urls
      if (body.type.split(";")[0] == "text/html") {
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
const rewriteOrigin = (req, res, remote) => {
  const { rewrite } = config;
  const url = remote + req.originalUrl;

  const origin = url.split("/")[1];
  const remoteURL = url.split("/").slice(2).join("/");
  console.log(url);

  let headers = req.headers;
  headers["origin"] = `${req.protocol}://${origin}`;
  headers["referer"] = `${req.protocol}://${origin}`;
  headers["host"] = `${req.protocol}://${origin}`;

  l("fetching", `${req.protocol}://${remoteURL}`);
  l("origin", `${req.protocol}://${origin}`);
  l("headers", headers);

  fetch(`${req.protocol}://${remoteURL}`, {
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
};

const { join } = require("path");
const app = require("express")();
const fetch = require("node-fetch");
const { log, cleanReqHeaders, cleanResHeaders, parseURL } = require("./util");

app.use(require("cors")());

let { hosts, resolvers } = {
  hosts: ["f1shproxy.ml"],
  resolvers: {
    browser: (req, res) => res.sendFile(join(__dirname, "index.html")),
  },
};

process.env.VERCEL && hosts.push(process.env.VERCEL_URL);

app.use("*", (req, res) => {
  const host = req.get("host"); // f1shproxy.ml or fp-12.vercel.app
  const remote = req.get("host").split(".")[0]; // google_com or fp-12 or f1shproxy
  const parsedRemote = parseURL(remote); // google.com
  const ogURL = req.originalUrl; // path after host such as /waffle?q=21

  if (hosts.includes(host) || host.split(".").length == 2)
    return resolvers.browser(req, res);

  if (resolvers[parsedRemote]) return resolvers[parsedRemote](req, res);

  const fixedOrigin = remote.endsWith("_or");
  log(`${req.protocol}://${parsedRemote}${ogURL}`, "remoteURL");

  let headers = {
    ...req.headers,
    origin: fixedOrigin
      ? parseURL(ogURL.split("/")[0])
      : `https://${parsedRemote}`,
    referer: `https://${parsedRemote}${ogURL}`,
    host: `https://${parsedRemote}`,
  };

  log(headers, "fetch headers");
  fetch(`https://${parsedRemote}${ogURL}`, {
    method: req.method,
    headers: cleanReqHeaders(headers),
    body: req.body || null,
  })
    .then((r) => {
      res.set(cleanResHeaders(Object.fromEntries(r.headers.entries())));
      return r.blob();
    })
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => res.send(Buffer.from(buf)));
    });
});

module.exports = app;

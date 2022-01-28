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
  // const { protocol } = req; // path after host such as /waffle?q=21
  const protocol = "https";
  const remoteHref = `${protocol}://${parsedRemote}`;

  if (hosts.includes(host) || host.split(".").length == 2)
    return resolvers.browser(req, res);

  if (resolvers[parsedRemote]) return resolvers[parsedRemote](req, res);

  const fixedOrigin = remote.endsWith("_or");

  const ogURL = fixedOrigin
    ? req.originalUrl.split("/").slice(1).join("/")
    : req.originalUrl;

  log(`${remoteHref}${ogURL}`, "remoteURL");

  let headers = cleanReqHeaders(req.headers);

  headers.origin &&
    (headers.origin = fixedOrigin
      ? parseURL(ogURL.split("/")[0])
      : parsedRemote);
  headers.referer && (headers.referer = `${remoteHref}${ogURL}`);
  headers.host = parsedRemote;

  log(headers, "fetch headers");
  fetch(`${remoteHref}${ogURL}`, {
    method: req.method,
    headers,
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

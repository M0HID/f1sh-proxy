const log = (i) =>
  typeof i === "array" ? console.log(i.join("\n")) : console.log(i);
const plog = (p, i) =>
  log(`[${p}] ${typeof i === "object" ? JSON.stringify(i) : i}`);
const parseURL = (u) => u.replace(/_/g, ".");
const encodeURL = (u) => u.replace(/\./g, "_");

const { join } = require("path");
const app = require("express")();
const fetch = require("node-fetch");

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
  plog("remoteURL", `${req.protocol}://${parsedRemote}${ogURL}`);

  const headers = {
    ...req.headers,
    origin: fixedOrigin
      ? parseURL(ogURL.split("/")[0])
      : `${req.protocol}://${parsedRemote}`,
    referer: `${req.protocol}://${parsedRemote}${ogURL}`,
    host: `${req.protocol}://${parsedRemote}`,
  };

  plog("fetch headers", headers);
  fetch(`${req.protocol}://${parsedRemote}${ogURL}`, {
    method: req.method,
    headers,
    body: req.body || null,
  })
    .then((r) => r.blob())
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => res.send(Buffer.from(buf)));
    });
});

module.exports = app;

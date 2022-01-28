const log = (i) =>
  typeof i === "array" ? console.log(i.join("\n")) : console.log(i);
const plog = (p, i) =>
  log(`[${p}] ${typeof i === "object" ? JSON.stringify(i) : i}`);

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

const parseURL = (u) => u.replace(/_/g, ".");
process.env.VERCEL && hosts.push(process.env.VERCEL_URL);

app.use("*", (req, res) => {
  const host = req.get("host").split(".").slice(-2).join("."); // f1shproxy.ml or vercel.app
  const remote = req.get("host").split(".")[0]; //google_com or f1shproxy-q5qabpj09-vishy-dev or f1shproxy
  const parsedRemote = parseURL(remote); //google.com
  const ogURL = req.originalUrl; // path after host such as /waffle?q=21

  plog("host", host);
  plog("remote", remote);
  plog("parsedRemote", parsedRemote);
  plog("ogURL", ogURL);
  plog("headers", req.headers);
  plog("fetchurl", `${req.protocol}://${parsedRemote}${ogURL}`);
  plog("hosts", hosts);

  if (remote == host.split(".")[0]) return resolvers.browser(req, res);
  if (remote == "browser") return resolvers.browser(req, res);
  if (host.split(".").length == 2) return resolvers.browser(req, res);

  const fixedOrigin = remote.endsWith("_or");

  const headers = {
    ...req.headers,
    origin: fixedOrigin
      ? parseURL(ogURL.split("/")[0])
      : `${req.protocol}://${parsedRemote}`,
    referer: `${req.protocol}://${parsedRemote}${ogURL}`,
    host: `${req.protocol}://${parsedRemote}`,
  };

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

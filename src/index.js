const { join } = require("path");
const app = require("express")();
const fetch = require("node-fetch");

app.use(require("cors")());

let { hosts, resolvers } = {
  hosts: ["f1shproxy.ml"],
  resolvers: {
    default: proxyURL,
    browser: (res) => res.sendFile(join(__dirname, "index.html")),
  },
};

const parseURL = (u) => u.replace(/_/g, ".");
process.env.VERCEL && hosts.push(process.env.VERCEL_URL);

app.use("*", (req, res) => {
  const host = req.get("host").split(".").reverse()[1]; // f1shproxy.ml
  const remote = req.get("host").split(".")[0]; //google_com
  const parsedRemote = parseURL(remote);
  const ogURL = req.originalUrl;

  if (remote == host.split(".")[0]) return resolvers.browser(req, res);
  if (remote == "browser") return resolvers.browser(req, res);

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

const { join } = require("path");
const app = require("express")();
const fetch = require("node-fetch");
const { CookieJar } = require("cookiejar");
const {
  log,
  cleanReqHeaders,
  parseURL,
  cleanGeneralHeaders,
} = require("./util");

app.use(require("cors")());

let { hosts, resolvers } = {
  hosts: ["f1shproxy.ml"],
  resolvers: {
    browser: (req, res) => res.sendFile(join(__dirname, "index.html")),
  },
};

process.env.VERCEL && hosts.push(process.env.VERCEL_URL);

app.use("*", (req, res) => {
  try {
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

    let headers = cleanReqHeaders(req.headers);

    headers.origin &&
      (headers.origin = fixedOrigin
        ? parseURL(ogURL.split("/")[0])
        : remoteHref);
    headers.referer && (headers.referer = `${remoteHref}${ogURL}`);
    headers.host = parsedRemote;

    log(`${remoteHref}${ogURL}`, "remoteURL");
    log(host, "host");
    log(remote, "remote");
    log(parsedRemote, "parsedRemote");
    log(protocol, "protocol");
    log(ogURL, "ogURL");
    log(remoteHref, "remoteHref");
    log(fixedOrigin, "fixedOrigin");
    log(headers, "sending headers");

    const jar = new CookieJar();
    return followFetch(`${remoteHref}${ogURL}`, res, jar, {
      method: req.method,
      headers,
      body: req.body || null,
      redirect: "manual",
    });
  } catch (e) {
    res.send(`error: ${e.messsage}\n\n${e.stack}`);
  }
});

const followFetch = async (url, res, jar, config) => {
  log(url, "followFetch URL");
  const r = await fetch(url, { ...config, redirect: "manual" });

  if ((r.status === 302 || r.status === 301) && r.headers.get("location")) {
    if (r.headers.has("set-cookie")) {
      log(r.headers.get("set-cookie"), "set-cookie");
      log(url.split("/")[2], "urlsc");
      jar.setCookies(
        r.headers.get("set-cookie"),
        url.split("/")[2],
        url.split("/")[3] || "/"
      );
    }

    return await followFetch(r.headers.get("location"), res, jar, {
      ...config,
      headers: {
        ...config.headers,
        host: r.headers.get("location").split("/")[2],
        cookie: jar.getCookies().toValueString(),
      },
    });
  }

  res.set(cleanGeneralHeaders(Object.fromEntries(r.headers.entries())));
  const body = await r.blob();
  res.type(body.type);
  body.arrayBuffer().then((buf) => res.send(Buffer.from(buf)));
  console.log("\n");
};

module.exports = app;

// app.listen(80);

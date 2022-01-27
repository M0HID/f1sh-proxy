const app = require("express")();
const fetch = require("node-fetch");

const config = {
  port: 3000,
  baseURL: "browser.f1shproxy.ml",
  host: "f1shproxy",
  otherHost: process.env.VERCEL_URL.split(".")[0].replace(/_/g, "."),
};

app.use(require("cors")());

app.use("*", function (req, res) {
  const remoteHost = req.get("host").split(".")[0].replace(/_/g, ".");
  let url = config.baseURL;

  if (remoteHost == "browser") return res.sendFile("index.html");
  else if (remoteHost != config.host && remoteHost != config.otherHost)
    url = remoteHost + req.originalUrl;

  let headers = req.headers;

  headers["origin"] && delete headers["origin"];
  headers["referer"] && delete headers["referer"];
  headers["host"] && delete headers["host"];

  process.env.DEBUG && console.log([req.method, url, req.protocol, remoteHost]);

  fetch(`${req.protocol}://${url}`, {
    method: req.method,
    headers,
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);

      // rewrite html to use our proxy on any urls
      if (body.type == "text/html") {
        const html = body.text().then((html) => {
          // rewrite any urls such as https://page.com/script.js to http://page_com.f1shproxy.ml/script.js
          const regex = /(https?:\/\/[^\s]+)/g;
          const newHtml = html.replace(regex, (match) => {
            const url = match.split("/")[2];
            const newUrl = url.replace(
              /(https?:\/\/)([^\s]+)/,
              `$1${config.baseURL}/$2`
            );
            return newUrl;
          });

          res.send(newHtml);
        });
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

const app = require("express")();
const fetch = require("node-fetch");

const config = {
  port: 3000,
  baseURL: "http://old.reddit.com",
};

app.use("*", function (req, res) {
  const remoteHost = req.get("host").split(".")[0].replace(/_/g, ".");
  console.log(remoteHost);

  var url = config.baseURL + req.originalUrl;

  console.log(`[${req.method}] ${url.substr(0, 60)}...`);
  fetch(url, {
    method: req.method,
    headers: { "User-Agent": req.headers["user-agent"] },
  })
    .then((res) => res.blob())
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => {
        res.send(Buffer.from(buf));
      });
    });
});

module.exports = app;

// app.listen(config.port, () => {
//   console.clear();
//   console.log(`[!] Proxy Started at http://localhost:${config.port}`);
// });

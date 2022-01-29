// const fetch = require("node-fetch");
// fetch("https://google.com/", {
//   headers: {
//     accept:
//       "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//     "accept-language": "en-US,en;q=0.9",
//     "cache-control": "no-cache",
//     pragma: "no-cache",
//     "sec-ch-ua":
//       '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
//     "sec-ch-ua-arch": '"x86"',
//     "sec-ch-ua-bitness": '"64"',
//     "sec-ch-ua-full-version": '"97.0.4692.99"',
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-model": '""',
//     "sec-ch-ua-platform": '"macOS"',
//     "sec-ch-ua-platform-version": '"12.0.0"',
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "none",
//     "sec-fetch-user": "?1",
//     // origin: "https://google.com/",
//   },
// })
//   .then((r) => r.text())
//   .then((r) => console.log(r));

const fetch = require("node-fetch");
fetch("https://www.webtoons.com/", {
  headers: {
    host: "www.webtoons.com",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "same-site",
    "sec-fetch-dest": "iframe",
    referer: "https://www.webtoons.com/",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    "sec-ch-ua-platform": '"macOS"',
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "sec-fetch-mode": "navigate",
    "accept-language": "en-US,en;q=0.9,nl;q=0.8",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
    "upgrade-insecure-requests": "1",
    "accept-encoding": "gzip, deflate, br",
    connection: "close",
  },
  redirect: "manual",
  follow: 5,
})
  .then((r) => {
    console.log(r);
    console.log(JSON.stringify(Object.fromEntries(r.headers.entries())));
    return r.text();
  })
  .then((r) => console.log(r));

const followFetch = (url, res, config) =>
  fetch(url, { ...config, redirect: "manual" })
    .then((r) => {
      // check if response is opaqueredirect and if so set host headers then re-fetch
      if ((r.status === 302 || r.status === 301) && r.headers.get("location")) {
        return followFetch(r.headers.get("location"), res, {
          ...config,
          headers: {
            ...config.headers,
            host: r.headers.get("location").split("/")[2],
          },
        });
      }
      res.set(cleanResHeaders(Object.fromEntries(r.headers.entries())));
      return r.blob();
    })
    .then((body) => {
      res.type(body.type);
      body.arrayBuffer().then((buf) => res.send(Buffer.from(buf)));
    });

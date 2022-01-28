const fetch = require("node-fetch");
fetch("https://google.com/", {
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    "sec-ch-ua-arch": '"x86"',
    "sec-ch-ua-bitness": '"64"',
    "sec-ch-ua-full-version": '"97.0.4692.99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": '""',
    "sec-ch-ua-platform": '"macOS"',
    "sec-ch-ua-platform-version": '"12.0.0"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    // origin: "https://google.com/",
  },
})
  .then((r) => r.text())
  .then((r) => console.log(r));

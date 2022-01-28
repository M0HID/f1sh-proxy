const fetch = require("node-fetch");
const { CookieJar } = require("cookiejar");

const jar = new CookieJar();
fetch("https://webtoon.com/", {
  method: "GET",
  redirect: "manual",
}).then((r) => {
  jar.setCookies(r.headers.raw()["set-cookie"], "https://webtoon.com/");
  console.log(r.headers.get("set-cookie"));
});

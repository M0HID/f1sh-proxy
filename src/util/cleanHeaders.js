const cleanReqHeaders = (headers) => {
  let hd = headers;
  Object.keys(headers).forEach((h) => {
    (h.startsWith("x-") || h.startsWith("content-")) && delete headers[h];
  });
  return hd;
};

const cleanResHeaders = (headers) => {
  let hd = headers;
  const filter = [
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
  ];

  Object.keys(headers).forEach((h) => {
    (h.startsWith("x-") || h.startsWith("content-") || filter.includes(h)) &&
      delete headers[h];
  });
  return hd;
};

const cleanGeneralHeaders = (headers) => {
  let hd = cleanResHeaders(headers);
  if (hd["content-length"] && hd["transfer-encoding"])
    delete hd["content-length"];
  return hd;
};

module.exports = { cleanReqHeaders, cleanResHeaders, cleanGeneralHeaders };

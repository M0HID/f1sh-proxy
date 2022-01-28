const parseURL = (u) => u.replace(/_/g, ".");
const encodeURL = (u) => u.replace(/\./g, "_");

module.exports = { parseURL, encodeURL };

const str = (i) => JSON.stringify(i);
const log = (msg, prefix) => {
  const prefix = `[${prefix}] ` || "";
  if (typeof i == "object") console.log(`${prefix}${str(i)}`);
  else console.log(`${prefix}${msg}`);
};

module.exports = { log };

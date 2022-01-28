const str = (i) => JSON.stringify(i);
const log = (msg, pf) => {
  const prefix = `[${pf}] ` || "";
  if (typeof i == "object") console.log(`${prefix}${str(i)}`);
  else console.log(`${prefix}${msg}`);
};

module.exports = { log };

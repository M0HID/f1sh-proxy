const str = (i) => JSON.stringify(i);

const log = (msg, pf) => {
  const prefix = `[${pf}] ` || "";
  if (typeof msg == "object") console.log(`${prefix}${str(msg)}`);
  else console.log(`${prefix}${msg}`);
};

module.exports = { log };

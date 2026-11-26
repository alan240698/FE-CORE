// Shared entry point - every Next.js app spreads this array TOGETHER WITH its own
// eslint-config-next (see apps/shell/eslint.config.mjs for usage).
module.exports = [...require("./boundaries"), ...require("./no-hardcoded-paths")];

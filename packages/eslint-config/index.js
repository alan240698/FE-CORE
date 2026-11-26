// Entry point dùng chung — mỗi app Next.js spread mảng này CÙNG VỚI
// eslint-config-next của riêng app đó (xem apps/shell/eslint.config.mjs để biết cách dùng).
module.exports = [...require("./boundaries"), ...require("./no-hardcoded-paths")];

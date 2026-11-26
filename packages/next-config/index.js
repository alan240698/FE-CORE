/**
 * Base Next.js config dung chung cho MOI app (shell va tung module).
 * Moi app goi withBaseConfig({...override rieng cua app do}) trong next.config.ts/js.
 *
 * LUU Y: day la shallow-merge don gian (spread "...config" de sau) - neu app rieng tu
 * khai "headers()" cua minh, no se GHI DE hoan toan headers() o day, khong gop lai.
 * Chap nhan duoc o quy mo hien tai (moi app it khi can header rieng) - ghi lai de tranh
 * ngo nhan la deep-merge.
 *
 * @param {import('next').NextConfig} [config]
 * @returns {import('next').NextConfig}
 */
function withBaseConfig(config = {}) {
  return {
    output: "standalone",
    images: {
      remotePatterns: [],
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ],
        },
      ];
    },
    ...config,
  };
}

module.exports = { withBaseConfig };

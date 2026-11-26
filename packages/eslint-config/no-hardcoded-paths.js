// Bắt buộc dùng <Link>/next/image hoặc router API thay vì viết tay path nội bộ.
// Lý do: basePath của Next.js KHÔNG tự thêm vào <a href> / <img src> viết tay — chỉ
// <Link>/<Image>/router API tự xử lý đúng. Nếu không ép luật này ngay từ đầu, việc
// nâng cấp 1 module từ "nội bộ" (path-based) lên "standalone" (domain riêng, không
// basePath) sẽ âm thầm vỡ link/ảnh. Xem module-noi-bo-vs-standalone-domain.md §2.

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name='a'] > JSXAttribute[name.name='href'] > Literal[value=/^\\//]",
          message:
            'Dùng <Link href=...> (next/link) thay vì <a href="/..."> viết tay — basePath sẽ không tự áp dụng khi module nâng cấp lên domain riêng.',
        },
        {
          selector:
            "JSXOpeningElement[name.name='img'] > JSXAttribute[name.name='src'] > Literal[value=/^\\//]",
          message:
            'Dùng <Image src=...> (next/image) thay vì <img src="/..."> viết tay — basePath sẽ không tự áp dụng khi module nâng cấp lên domain riêng.',
        },
      ],
    },
  },
];

// Require <Link>/next/image or router APIs instead of hand-written internal paths.
// Reason: Next.js's basePath does NOT automatically get prepended to a hand-written
// <a href> / <img src> - only <Link>/<Image>/router APIs handle this correctly. Without
// enforcing this from day one, promoting a module from "internal" (path-based) to
// "standalone" (its own domain, no basePath) would silently break links/images. See
// module-noi-bo-vs-standalone-domain.md section 2.

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
            'Use <Link href=...> (next/link) instead of a hand-written <a href="/...">; basePath will not be applied automatically once the module is promoted to its own domain.',
        },
        {
          selector:
            "JSXOpeningElement[name.name='img'] > JSXAttribute[name.name='src'] > Literal[value=/^\\//]",
          message:
            'Use <Image src=...> (next/image) instead of a hand-written <img src="/...">; basePath will not be applied automatically once the module is promoted to its own domain.',
        },
      ],
    },
  },
];

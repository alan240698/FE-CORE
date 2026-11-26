// THE ONLY public surface of @archetype/i18n - named exports only, never "export *"
// (see nguyen-tac-code-fe-va-tai-lieu-cho-ai.md section 2.1).

/**
 * Minimal i18n MECHANISM - not a translation library. The content (the actual
 * Vietnamese text) lives per-module, in a `messages/vi.ts` file that module owns -
 * see apps/it-ticket/modules/it-ticket/messages/vi.ts for the reference pattern.
 *
 * Next.js App Router (unlike the old Pages Router) has no built-in i18n routing, and
 * there is only ONE locale in this product today (Vietnamese) - no user has ever
 * needed a 2nd one. A full library (next-intl, with its locale-segment routing and
 * middleware) would require mechanisms this repo has zero use for yet. This function
 * does exactly one thing: it's an identity function with a generic signature, so a
 * module's message object keeps its literal key types (autocomplete, and a compile
 * error if a 2nd locale file is ever added with a missing/misspelled key).
 *
 * When a 2nd locale is genuinely needed: add a sibling `messages/en.ts` with the SAME
 * shape (TypeScript will flag missing keys), then decide how to pick a locale at
 * runtime (query param, cookie, Accept-Language header...) - don't guess that
 * mechanism ahead of time, since the 3 options behave very differently and the Multi-
 * Zones basePath routing already in place changes which ones are even viable.
 */
export function createMessages<T extends Record<string, string>>(messages: T): T {
  return messages;
}

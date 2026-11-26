# ADR 0001 — Không triển khai cơ chế chia sẻ bundle JS giữa các Multi-Zones app

**Ngày:** 2026-11-26
**Trạng thái:** Chấp nhận (accepted) — xem lại khi ngưỡng ở mục "Khi nào xem lại" xảy ra.

## Bối cảnh

Mỗi module nghiệp vụ (`shell`, `it-ticket`, và các module sau này) là 1 Next.js app độc lập,
deploy riêng (Next.js Multi-Zones, path-based routing qua `basePath` + rewrite — xem
`scripts/generate-infra.ts`). Audit kiến trúc toàn diện (`audit-nextjs-core-principal-architect-2026-11-26.md`,
repo `archetype-intranet-new`, finding PERF-3) xác nhận thật: mỗi app tự bundle riêng
React/Redux Toolkit/RTK Query — ~100-230KB vendor JS trùng lặp giữa các zone, không chia sẻ được
qua browser cache (khác origin/path, khác hash).

## Đã cân nhắc

1. **Module Federation** (Webpack plugin) — **không khả thi** với Turbopack mà repo đang dùng
   (mọi `next.config.ts` đều có `turbopack: { rules: {...} }` cho CSS). Turbopack không chạy được
   Webpack plugin, không nhận `webpack()` config tùy chỉnh. Dùng Module Federation đồng nghĩa phải
   bỏ Turbopack hoàn toàn, quay lại Webpack cho MỌI app — mất tốc độ dev/build mà dự án đã chọn
   Turbopack để có. `next-rspack` (thay thế tiềm năng) vẫn experimental, chưa có xác nhận chính
   thức hỗ trợ Module Federation cho micro-frontend (xem thảo luận
   [vercel/next.js#77800](https://github.com/vercel/next.js/discussions/77800), chưa có câu trả lời).

2. **CDN-shared vendor bundle (externals)** — cơ chế "externals" (đánh dấu React/Redux là global,
   nạp qua `<script>` CDN chung) là cơ chế của Webpack (`resolve.externals`), **không có đường đi
   sạch dưới Turbopack**. Turbopack's `next.config.js` chỉ có `resolveAlias` (tương đương
   `resolve.alias`, KHÔNG phải `externals`), và tài liệu chính thức xác nhận không hỗ trợ cả
   `esmExternals` cũ. Có thể "chế" bằng `resolveAlias` trỏ về 1 shim đọc `window.React`, nhưng
   React 19 có nhiều entry point (`react/jsx-runtime`, `scheduler`...) đều cần shim riêng — hacky,
   dễ vỡ khi update React, không đáng tin cho production. Rủi ro thêm: phải nới `script-src` trong
   CSP hiện có (`'self' 'unsafe-inline'`, xem `packages/next-config/index.js`) để cho phép domain
   CDN, và version mismatch giữa các app nếu lệch bản React.

3. **Gộp thành 1 Next.js app duy nhất** (bỏ Multi-Zones, dùng route groups thay vì zone riêng) —
   loại bỏ trùng lặp hoàn toàn, nhưng phá vỡ đúng mục tiêu ban đầu chọn Multi-Zones: deploy/rollback
   **độc lập từng module** (đã verify thật qua `infra/swarm/*.yml` — mỗi module tự Swarm stack
   riêng, tự healthcheck riêng).

4. **Turborepo remote caching** — khác vấn đề hoàn toàn, không nhầm lẫn: remote cache tăng tốc
   build/CI (tái dùng kết quả `turbo run build` đã build trước), KHÔNG ảnh hưởng gì tới kích thước
   bundle JS mà trình duyệt người dùng cuối phải tải.

## Quyết định

**KHÔNG triển khai gì ngay.** Ở quy mô hiện tại (2 app, 1 module nghiệp vụ thật, ~100-230KB trùng
lặp/module), chi phí của cả 2 giải pháp khả thi về mặt kỹ thuật (Module Federation, CDN externals)
đều lớn hơn lợi ích thật — đúng tinh thần "tránh premature optimization" dự án này đã tự áp dụng
xuyên suốt (audit trước xác nhận: 0 `useMemo`/`useCallback` không có bằng chứng, được ghi nhận là
điểm cộng, không phải thiếu sót).

## Khi nào xem lại quyết định này

- Khi có **≥ 4-5 module thật** (tổng vendor JS trùng lặp tích lũy đủ lớn để đáng cân nhắc lại —
  hiện tại 2 app × ~100-230KB chưa phải vấn đề thật).
- Khi `next-rspack` + Module Federation ra khỏi giai đoạn experimental và có xác nhận chính thức
  hỗ trợ pattern micro-frontend.
- Khi có dữ liệu thật (Real User Monitoring / Lighthouse CI) cho thấy bundle size trùng lặp đang
  ảnh hưởng thật tới Core Web Vitals của người dùng — không nên tối ưu dựa trên ước lượng lý
  thuyết.

## Liên quan

- `audit-nextjs-core-principal-architect-2026-11-26.md` (repo `archetype-intranet-new`), finding
  PERF-3 và roadmap mục P3-2.
- `scripts/generate-infra.ts`, `infra/swarm/*.yml` — lý do kỹ thuật Multi-Zones/Swarm-độc-lập được
  chọn ngay từ đầu, vẫn còn đúng và là ràng buộc chính khiến phương án 3 (gộp 1 app) bị loại.

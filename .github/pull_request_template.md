<!-- Xem CONTRIBUTING.md trước khi mở PR. Commit message phải theo Conventional Commits
     (bắt buộc bởi commit-msg hook) - PR title nên theo format tương tự. -->

## Thay đổi gì, và vì sao

<!-- Mô tả root cause nếu là bug fix, không chỉ "fix bug X". Nếu đây là PR SỬA TRỰC TIẾP
     packages/core (không phải mở rộng qua injectEndpoints()/AuthStrategy mới), giải
     thích rõ vì sao không mở rộng được - xem packages/core/CLAUDE.md. -->

## Đã verify bằng cách nào

<!-- Lệnh thật đã chạy, không phải "có vẻ ổn". Với thay đổi liên quan basePath/headers/
     Multi-Zones, verify qua standalone server thật (xem CONTRIBUTING.md mục
     "Trước khi mở Pull Request") - next start KHÔNG đủ tin cậy cho việc này. -->

- [ ] `pnpm run lint && pnpm run type-check && pnpm run test && pnpm run build`
- [ ] `pnpm run depcruise` (0 vi phạm boundary/circular dependency)
- [ ] `pnpm exec prettier --check .`
- [ ] Nếu sửa `modules.config.ts`/`environments.config.ts`/`feature-flags.config.ts`:
      đã chạy `pnpm run generate-infra` và commit file sinh ra
- [ ] Nếu thêm feature flag: có consumer thật + test cho cả 2 trạng thái (không phải
      flag "để sẵn")
- [ ] Nếu PR gọi API ngoài (Laravel): response được validate bằng Zod
      (`transformResponse`), không chỉ ép kiểu tĩnh `as T`

## Phạm vi ảnh hưởng

<!-- Chỉ 1 app/module, hay thay đổi packages/ dùng chung? Nếu dùng chung, CODEOWNERS sẽ
     tự yêu cầu review từ @archetype-group/frontend-platform. -->

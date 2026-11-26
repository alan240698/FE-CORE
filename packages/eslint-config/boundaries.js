// Ép buộc ranh giới kiến trúc bằng công cụ, không dựa vào tự giác.
// Cài đặt bằng core ESLint "no-restricted-imports" (không cần thêm plugin) —
// đơn giản hơn eslint-plugin-boundaries nhưng đủ cho 2 ranh giới quan trọng nhất
// của dự án này (xem best-practice-structure.md + nguyen-tac-code-fe-va-tai-lieu-cho-ai.md §2.6):
//
// 1) modules/<module>/domain/** (business logic thuần) KHÔNG được import React/Next.js.
// 2) Không ai được import sâu vào nội bộ package @archetype/* — chỉ qua public surface (index.ts).
//
// LƯU Ý QUAN TRỌNG: trong ESLint flat config, nếu 2 config object cùng set 1 rule cho
// cùng 1 file, config đứng SAU sẽ GHI ĐÈ HOÀN TOÀN (không gộp mảng) config đứng trước cho
// đúng rule đó — vì vậy domain/ dùng 1 block DUY NHẤT gộp sẵn cả 2 nhóm pattern, không tách
// thành 2 block "no-restricted-imports" riêng áp cùng lên 1 file.

const noDeepImportArchetype = {
  group: ["@archetype/*/*"],
  message:
    "Chỉ import từ public surface của package (vd '@archetype/core', không phải '@archetype/core/auth/authSlice').",
};

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Áp dụng cho MỌI file .ts/.tsx — chỉ 1 ranh giới: không import sâu vào @archetype/*
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [noDeepImportArchetype] }],
    },
  },
  // Riêng domain/ — gộp THÊM ranh giới "không React/Next" vào CÙNG 1 rule, không tách block
  {
    files: ["**/modules/*/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message:
                "domain/ là business logic thuần, không được import React — xem nguyen-tac-code-fe-va-tai-lieu-cho-ai.md §2.6.",
            },
          ],
          patterns: [
            noDeepImportArchetype,
            {
              group: ["next", "next/*", "react-dom", "react-dom/*"],
              message:
                "domain/ là business logic thuần, không được import Next.js/React-DOM — xem nguyen-tac-code-fe-va-tai-lieu-cho-ai.md §2.6.",
            },
          ],
        },
      ],
    },
  },
];

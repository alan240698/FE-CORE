import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validate bien moi truong LUC BUILD - fail nhanh neu thieu/sai, khong de toi production
 * moi phat hien (xem nghien-cuu-cong-cu-fe-chuyen-nghiep.md muc audit + best-practice-structure.md).
 *
 * Moi app goi createArchetypeEnv({...}) trong 1 file env.ts rieng cua minh, truyen vao
 * danh sach bien NEXT_PUBLIC_* ma app do that su dung.
 *
 * LUU Y VE TYPE: @t3-oss/env-nextjs dung "branded key type" de ep key phai bat dau
 * bang "NEXT_PUBLIC_" ngay luc compile - wrapper nay KHONG the gop generic do mot
 * cach an toan tuyet doi ve type (da tu kiem chung that: TS2322 that khi thu dung
 * Record<string, ZodTypeAny> lam constraint). Chap nhan "as never" o diem goi createEnv -
 * runtime van dung (t3-env tu validate prefix thua), chi mat canh bao ten bien sai NGAY
 * LUC VIET CODE wrapper nay (van con nguyen o tung app goi createArchetypeEnv).
 */
export function createArchetypeEnv<TClient extends Record<string, z.ZodTypeAny>>(
  clientSchema: TClient,
) {
  const runtimeEnv = Object.keys(clientSchema).reduce<Record<string, string | undefined>>(
    (acc, key) => {
      acc[key] = process.env[key];
      return acc;
    },
    {},
  );

  return createEnv({
    client: clientSchema as never,
    experimental__runtimeEnv: runtimeEnv,
  });
}

// Schema dung chung toi thieu moi app deu can - tung app tu mo rong them neu can.
export const baseClientEnvSchema = {
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
};

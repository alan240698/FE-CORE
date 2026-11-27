import { z } from "zod";
import { baseApi } from "../store/baseApi";
import { parseApiResponse } from "../api-client/parseApiResponse";

export interface MenuItem {
  label: string;
  path: string;
  children?: MenuItem[];
}

// MenuItem is recursive (children: MenuItem[]), so the type must be hand-written and
// the schema typed explicitly as z.ZodType<MenuItem> - z.infer cannot resolve a type
// that references itself through z.lazy() (this is Zod's own documented pattern for
// recursive schemas, not a workaround specific to this repo).
const MenuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    path: z.string(),
    children: z.array(MenuItemSchema).optional(),
  }),
);

const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<MenuItem[], void>({
      query: () => "/me/menu",
      transformResponse: (raw) => parseApiResponse(z.array(MenuItemSchema), raw, "getMenu"),
    }),
  }),
});

export const { useGetMenuQuery } = menuApi;

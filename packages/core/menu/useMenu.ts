import { baseApi } from "../store/baseApi";

export interface MenuItem {
  label: string;
  path: string;
  children?: MenuItem[];
}

const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<MenuItem[], void>({
      query: () => "/me/menu",
    }),
  }),
});

export const { useGetMenuQuery } = menuApi;

import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authSlice";
import { baseApi } from "../store/baseApi";

/**
 * This is the single most important test in this package. It directly verifies the
 * fix for a real concurrency bug: before the mutex was added, N concurrent requests
 * hitting 401 at the same time would each independently call /auth/refresh. This test
 * fires 3 concurrent requests against 3 DIFFERENT cache keys (so RTK Query does not
 * simply dedupe them into one network call on its own) and asserts the refresh
 * endpoint is only ever hit ONCE.
 */

let refreshCallCount = 0;
const VALID_TOKEN = "refreshed-token";

const server = setupServer(
  http.post("*/auth/refresh", () => {
    refreshCallCount += 1;
    return HttpResponse.json({ accessToken: VALID_TOKEN });
  }),
  http.get("*/protected/:id", ({ request }) => {
    const auth = request.headers.get("authorization");
    if (auth === `Bearer ${VALID_TOKEN}`) {
      return HttpResponse.json({ ok: true });
    }
    return new HttpResponse(null, { status: 401 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  refreshCallCount = 0;
});
afterAll(() => server.close());

function makeTestStore() {
  const testApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getProtected: builder.query<{ ok: boolean }, number>({
        query: (id) => `/protected/${id}`,
      }),
    }),
    overrideExisting: true,
  });

  const store = configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    // Start with an expired/invalid token so the first real request hits 401 and
    // triggers the refresh path - this is the exact scenario the mutex protects.
    preloadedState: {
      auth: { accessToken: "expired-token", user: null, permissions: [] },
    },
  });

  return { store, testApi };
}

describe("baseQueryWithReauth - concurrent 401 race condition", () => {
  it("only calls /auth/refresh ONCE even when 3 requests hit 401 at the same time", async () => {
    const { store, testApi } = makeTestStore();

    const results = await Promise.all([
      store.dispatch(testApi.endpoints.getProtected.initiate(1)),
      store.dispatch(testApi.endpoints.getProtected.initiate(2)),
      store.dispatch(testApi.endpoints.getProtected.initiate(3)),
    ]);

    expect(refreshCallCount).toBe(1);

    for (const result of results) {
      expect(result.data).toEqual({ ok: true });
    }

    expect(store.getState().auth.accessToken).toBe(VALID_TOKEN);
  });

  it("dispatches clearCredentials when refresh itself fails", async () => {
    server.use(http.post("*/auth/refresh", () => new HttpResponse(null, { status: 401 })));

    const { store, testApi } = makeTestStore();
    const result = await store.dispatch(testApi.endpoints.getProtected.initiate(1));

    expect(result.error).toBeDefined();
    expect(store.getState().auth.accessToken).toBeNull();
  });
});

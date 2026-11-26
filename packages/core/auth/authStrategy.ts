import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { AuthState } from "./authSlice";

/**
 * The part of "how auth works" that's allowed to vary without touching
 * createBaseQueryWithReauth() (CLOSED - see authApi.ts). Everything else about
 * authentication (the mutex, the 401-retry sequence, cookie forwarding) is fixed and
 * shared by every strategy - only HOW credentials get attached and HOW a refresh is
 * attempted belong to the strategy.
 *
 * Today there is exactly one implementation (cookieJwtStrategy, below) - Archetype
 * Group is one company with one backend, so there is no second strategy to write yet.
 * This interface exists so that IF a module ever needs a different auth mechanism
 * (SSO/SAML, an API key, ...), it adds a new AuthStrategy and calls
 * createBaseQueryWithReauth(thatStrategy) for its own baseApi - without touching this
 * file, cookieJwtStrategy, or the mutex/retry logic every other module relies on.
 */
export interface AuthStrategy {
  /** Attach whatever credential this strategy uses to the outgoing request. */
  prepareHeaders(headers: Headers, state: { auth: AuthState }): Headers;

  /**
   * Attempt to restore a valid session after a 401. Return true if the caller should
   * retry the original request (a new credential is now in place), false if the
   * session is genuinely over. The strategy is responsible for dispatching whatever
   * state change that implies (e.g. setCredentials/clearCredentials) - the mutex/retry
   * logic calling this has no idea what state a given strategy keeps.
   */
  refresh(
    rawBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    api: BaseQueryApi,
    extraOptions: object,
  ): Promise<boolean>;
}

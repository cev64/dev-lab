/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as licenses from "../licenses.js";
import type * as metrics from "../metrics.js";
import type * as model_nfl from "../model/nfl.js";
import type * as orders from "../orders.js";
import type * as rateLimit from "../rateLimit.js";
import type * as refresh from "../refresh.js";
import type * as snapshots from "../snapshots.js";
import type * as subscribers from "../subscribers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  email: typeof email;
  events: typeof events;
  http: typeof http;
  lib: typeof lib;
  licenses: typeof licenses;
  metrics: typeof metrics;
  "model/nfl": typeof model_nfl;
  orders: typeof orders;
  rateLimit: typeof rateLimit;
  refresh: typeof refresh;
  snapshots: typeof snapshots;
  subscribers: typeof subscribers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

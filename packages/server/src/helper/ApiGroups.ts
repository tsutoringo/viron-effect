import type { HttpApi } from "@effect/platform";

/**
 * Extracts the HttpApiGroups from a given HttpApi type.
 */
export type ApiGroups<Api extends HttpApi.HttpApi.Any> =
  // biome-ignore lint/suspicious/noExplicitAny: Library use
  Api extends HttpApi.HttpApi<any, infer Groups, any, any> ? Groups : never;

import type { HttpApiGroup } from "@effect/platform";
import type { Schema } from "effect";
import type { EndpointFor } from "./endpoint";
import type { VironTableContent } from "./schema";

export type VironEffectContent<Groups extends HttpApiGroup.HttpApiGroup.Any> = (
  | VironEffectContentNumber<Groups>
  | VironEffectContentTable<Groups>
) &
  VironEffectContentBase;

type VironEffectContentBase = {
  title: string;
  resourceId: string;
};

type VironEffectContentNumber<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  Endpoint extends EndpointFor<Groups, { number: number }> = EndpointFor<
    Groups,
    { number: number }
  >,
> = {
  type: "number";
  /**
   * The identifier of the endpoint to fetch data from, in the format "GroupName.EndpointName".
   *
   * **Troubleshooting: If the expected endpoint doesn't appear in autocomplete:**
   *
   * Only endpoints that return `{ number: number }` as their success response will be available here.
   * If your endpoint isn't showing up, it means the success schema doesn't match this type.
   *
   * **Solution:**
   * Ensure your endpoint uses `.addSuccess(VironNumberContent)` or `.addSuccess(Schema.Struct({ number: Schema.Number }))`.
   *
   * **Correct example:**
   * ```typescript
   * import { VironNumberContent } from "@viron-effect/server";
   *
   * HttpApiEndpoint.get("getActiveUserCount")`/metrics/active-users`
   *   .addSuccess(VironNumberContent)
   * ```
   *
   * **Incorrect example:**
   * ```typescript
   * // ❌ Wrong: Missing the correct success schema
   * HttpApiEndpoint.get("getActiveUserCount")`/metrics/active-users`
   *   .addSuccess(Schema.Number) // This won't work - needs to be wrapped in { number: ... }
   * ```
   *
   * **Note:** If this property shows as `never`, it means no endpoints in your API match the required type.
   */
  endpoint: Endpoint["identifier"];
};

type VironEffectContentTable<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  Endpoint extends EndpointFor<
    Groups,
    Schema.Schema.Type<ReturnType<typeof VironTableContent<Schema.Schema.Any>>>
  > = EndpointFor<
    Groups,
    Schema.Schema.Type<ReturnType<typeof VironTableContent<Schema.Schema.Any>>>
  >,
> = {
  type: "table";
  /**
   * The identifier of the endpoint to fetch data from, in the format "GroupName.EndpointName".
   *
   * **Troubleshooting: If the expected endpoint doesn't appear in autocomplete:**
   *
   * Only endpoints that return `{ list: Array<T> }` as their success response will be available here.
   * If your endpoint isn't showing up, it means the success schema doesn't match this type.
   *
   * **Solution:**
   * Ensure your endpoint uses `.addSuccess(VironTableContent(YourSchema))` where `YourSchema` is the schema for each item in the list.
   *
   * **Correct example:**
   * ```typescript
   * import { VironTableContent } from "@viron-effect/server";
   *
   * const UserSchema = Schema.Struct({
   *   id: Schema.String,
   *   name: Schema.String,
   * });
   *
   * HttpApiEndpoint.get("listUsers")`/users`
   *   .addSuccess(VironTableContent(UserSchema))
   * ```
   *
   * **Incorrect example:**
   * ```typescript
   * // ❌ Wrong: Using a plain array instead of VironTableContent
   * HttpApiEndpoint.get("listUsers")`/users`
   *   .addSuccess(Schema.Array(UserSchema)) // This won't work - needs { list: [...] } wrapper
   *
   * // ❌ Wrong: Not wrapping with VironTableContent
   * HttpApiEndpoint.get("listUsers")`/users`
   *   .addSuccess(UserSchema) // This won't work - returns a single item, not a list
   * ```
   *
   * **Note:** If this property shows as `never`, it means no endpoints in your API match the required type.
   */
  endpoint: Endpoint["identifier"];
};

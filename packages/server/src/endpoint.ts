import type { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Option, Record } from "effect";

/**
 * Template literal type representing an endpoint identifier in the format "GroupName.EndpointName"
 *
 * @example
 * type UserId = EndpointIdentifier<"User", "getUser"> // "User.getUser"
 */
export type EndpointIdentifier<
  GroupName extends string,
  EndpointName extends string,
> = `${GroupName}.${EndpointName}` | [GroupName, EndpointName];

/**
 * Extracts endpoint information from API groups based on the success response type.
 * Filters endpoints that match the specified Success type and returns their metadata.
 *
 * @template Groups - The API group types
 * @template Success - The expected success response type to filter by
 *
 * @example
 * ```typescript
 * type NumberEndpoint = EndpointFor<MyApiGroups, { number: number }>
 * // Returns metadata for endpoints returning { number: number }
 * ```
 */
export type EndpointFor<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  Success,
> = {
  [GroupName in HttpApiGroup.HttpApiGroup.Name<Groups>]: EndpointForGroup<
    Groups,
    GroupName,
    Success
  >;
}[HttpApiGroup.HttpApiGroup.Name<Groups>];

/**
 * Helper type to extract endpoint information for a specific group
 */
type EndpointForGroup<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  GroupName extends HttpApiGroup.HttpApiGroup.Name<Groups>,
  Success,
> = {
  [EndpointName in HttpApiEndpoint.HttpApiEndpoint.Name<
    GroupEndpoints<Groups, GroupName>
  >]: MatchesSuccessType<
    GroupEndpoints<Groups, GroupName>,
    EndpointName,
    Success
  > extends true
    ? EndpointMetadata<Groups, GroupName, EndpointName>
    : never;
}[HttpApiEndpoint.HttpApiEndpoint.Name<GroupEndpoints<Groups, GroupName>>];

/**
 * Helper type to get all endpoints for a specific group
 */
type GroupEndpoints<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  GroupName extends HttpApiGroup.HttpApiGroup.Name<Groups>,
> = HttpApiGroup.HttpApiGroup.Endpoints<
  HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>
>;

/**
 * Helper type to get a specific endpoint by name from a group's endpoints
 */
type EndpointByName<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  GroupName extends HttpApiGroup.HttpApiGroup.Name<Groups>,
  EndpointName extends HttpApiEndpoint.HttpApiEndpoint.Name<
    GroupEndpoints<Groups, GroupName>
  >,
> = HttpApiEndpoint.HttpApiEndpoint.WithName<
  GroupEndpoints<Groups, GroupName>,
  EndpointName
>;

/**
 * Type guard to check if an endpoint's success type matches the expected Success type
 */
type MatchesSuccessType<
  Endpoints extends HttpApiEndpoint.HttpApiEndpoint.Any,
  EndpointName extends HttpApiEndpoint.HttpApiEndpoint.Name<Endpoints>,
  Success,
> = HttpApiEndpoint.HttpApiEndpoint.WithName<
  Endpoints,
  EndpointName
> extends EndpointWithSuccessType<Endpoints, Success>
  ? true
  : false;

/**
 * Conditional type that matches endpoints with a specific success response type
 */
type EndpointWithSuccessType<
  Endpoints extends HttpApiEndpoint.HttpApiEndpoint.Any,
  Success,
> = Endpoints extends HttpApiEndpoint.HttpApiEndpoint<
  infer Name,
  infer Method,
  infer Path,
  infer UrlParams,
  infer Payload,
  infer Headers,
  Success,
  infer Error,
  infer R,
  infer RE
>
  ? HttpApiEndpoint.HttpApiEndpoint<
      Name,
      Method,
      Path,
      UrlParams,
      Payload,
      Headers,
      Success,
      Error,
      R,
      RE
    >
  : never;

/**
 * Metadata object containing endpoint information
 */
type EndpointMetadata<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  GroupName extends HttpApiGroup.HttpApiGroup.Name<Groups>,
  EndpointName extends HttpApiEndpoint.HttpApiEndpoint.Name<
    GroupEndpoints<Groups, GroupName>
  >,
> = {
  readonly identifier: EndpointIdentifier<GroupName, EndpointName>;
  readonly group: HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>;
  readonly endpoint: EndpointByName<Groups, GroupName, EndpointName>;
};

/**
 * Retrieves an endpoint and its group by parsing an endpoint identifier.
 * Returns an Option containing the group and endpoint tuple if found.
 *
 * @param groups - Record of API groups
 * @param endpointIdentifier - Dot-separated identifier in format "GroupName.EndpointName"
 * @returns Option containing [group, endpoint] tuple or None if not found
 *
 * @example
 * ```typescript
 * const result = getEndpointByIdentifier(apiGroups, "User.getUser")
 * // Option<[UserGroup, GetUserEndpoint]>
 * ```
 */
export const getEndpointByIdentifier = <
  Groups extends Record.ReadonlyRecord<
    string,
    HttpApiGroup.HttpApiGroup.AnyWithProps
  >,
  GroupName extends string,
  EndpointName extends string,
>(
  groups: Groups,
  endpointIdentifier: EndpointIdentifier<GroupName, EndpointName>,
) => {
  const [groupName, endpointName] = Array.isArray(endpointIdentifier)
    ? endpointIdentifier
    : (endpointIdentifier.split(".") as [GroupName, EndpointName]);

  return Record.get(groups, groupName).pipe(
    Option.flatMap((group) =>
      Record.get(group.endpoints, endpointName).pipe(
        Option.map((endpoint) => [group, endpoint] as const),
      ),
    ),
  );
};

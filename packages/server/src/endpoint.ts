import type { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Option, Record } from "effect";

export type EndpointFor<Groups extends HttpApiGroup.HttpApiGroup.Any> = {
  [GroupName in HttpApiGroup.HttpApiGroup.Name<Groups>]: {
    [EndpointName in HttpApiEndpoint.HttpApiEndpoint.Name<
      HttpApiGroup.HttpApiGroup.Endpoints<
        HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>
      >
    >]: {
      identifier: EndpointIdentifier<GroupName, EndpointName>;
      group: HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>;
      endpoint: HttpApiEndpoint.HttpApiEndpoint.WithName<
        HttpApiGroup.HttpApiGroup.Endpoints<
          HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>
        >,
        EndpointName
      >;
    };
  }[HttpApiEndpoint.HttpApiEndpoint.Name<
    HttpApiGroup.HttpApiGroup.Endpoints<
      HttpApiGroup.HttpApiGroup.WithName<Groups, GroupName>
    >
  >];
}[HttpApiGroup.HttpApiGroup.Name<Groups>];

export type EndpointIdentifier<
  GroupName extends string,
  EndpointName extends string,
> = `${GroupName}.${EndpointName}`;

export const getEndpointByEndpointIdentifier = <
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
  const [groupName, endpointName] = endpointIdentifier.split(".") as [
    GroupName,
    EndpointName,
  ];

  return Record.get(groups, groupName).pipe(
    Option.flatMap((group) =>
      Record.get(group.endpoints, endpointName).pipe(
        Option.map((endpoint) => [group, endpoint] as const),
      ),
    ),
  );
};

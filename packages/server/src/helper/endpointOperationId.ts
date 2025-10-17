import {
  type HttpApiEndpoint,
  type HttpApiGroup,
  OpenApi,
} from "@effect/platform";
import { Context } from "effect";

/**
 * source from {@link https://github.com/Effect-TS/effect/blob/bf369b2902a0e0b195d957c18b9efd180942cf8b/packages/platform/src/OpenApi.ts#L327-L331}
 */
export const getEndpointOperationId = (
  group: HttpApiGroup.HttpApiGroup.AnyWithProps,
  endpoint: HttpApiEndpoint.HttpApiEndpoint.AnyWithProps,
) => {
  return Context.getOrElse(endpoint.annotations, OpenApi.Identifier, () =>
    group.topLevel ? endpoint.name : `${group.identifier}.${endpoint.name}`,
  );
};

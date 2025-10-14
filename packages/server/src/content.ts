import type { HttpApiGroup } from "@effect/platform";
import type { EndpointFor } from "./endpoint";

export type VironEffectContent<Groups extends HttpApiGroup.HttpApiGroup.Any> = (
  | VironEffectContentNumber
  | VironEffectContentTable
) &
  VironEffectContentBase<Groups>;

type VironEffectContentBase<
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  Endpoint extends EndpointFor<Groups> = EndpointFor<Groups>,
> = {
  title: string;
  endpoint: Endpoint["identifier"];
  resourceId: string;
};

type VironEffectContentNumber = {
  type: "number";
};

type VironEffectContentTable = {
  type: "table";
};

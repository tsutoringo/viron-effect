import type { HttpApiGroup } from "@effect/platform";
import { Data } from "effect";
import type { VironEffectContent } from "./content";

interface VironPageDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: Page<
    this["A"] extends HttpApiGroup.HttpApiGroup.Any ? this["A"] : never
  >;
}

export type Page<Group extends HttpApiGroup.HttpApiGroup.Any> =
  Data.TaggedEnum<{
    Item: {
      readonly id: string;
      readonly title: string;
      readonly description?: string;
      readonly contents: VironEffectContent<Group>[];
    };
    Group: {
      readonly group: string;
      readonly child: WithName<"Item", Group>[] | WithName<"Group", Group>[];
    };
  }>;

/**
 * A Page with a specific _tag within a specific HttpApiGroup type.
 */
export type WithName<
  Name extends Page<Groups>["_tag"],
  Groups extends HttpApiGroup.HttpApiGroup.Any,
> = Extract<Page<Groups>, { _tag: Name }>;

export const { Item, Group, $match, $is } =
  Data.taggedEnum<VironPageDefinition>();

export function* walkPages<Group extends HttpApiGroup.HttpApiGroup.Any>(
  path: string[],
  page: Page<Group>,
): Generator<{ path: string[]; page: WithName<"Item", Group> }, void, void> {
  switch (page._tag) {
    case "Item": {
      yield { path, page };
      break;
    }
    case "Group": {
      yield* page.child[Symbol.iterator]().flatMap((child) =>
        walkPages([...path, page.group], child),
      );

      break;
    }
  }
}

import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { SampleHttpApi } from "../api";

/**
 * User group handlers implementation
 */
export const SampleUserGroupLive = HttpApiBuilder.group(
  SampleHttpApi,
  "User",
  (handlers) =>
    handlers
      .handle("getUser", ({ path }) =>
        Effect.succeed({
          id: path.id,
          name: `Sample User ${path.id}`,
          email: `${path.id}@example.com`,
        }),
      )
      .handle("listUsers", () =>
        Effect.succeed({
          list: [
            {
              id: "1",
              name: "Alice",
              email: "alice@example.com",
            },
            {
              id: "2",
              name: "Bob",
              email: "bob@example.com",
            },
          ],
        }),
      ),
);

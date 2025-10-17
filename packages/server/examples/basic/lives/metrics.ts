import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { SampleVironServer } from "../api";

/**
 * Metrics group handlers implementation
 */
export const SampleMetricsGroupLive = HttpApiBuilder.group(
  SampleVironServer,
  "Metrics",
  (handlers) =>
    handlers
      .handle("getActiveUserCount", () =>
        Effect.succeed({
          number: 42,
        }),
      )
      .handle("getTotalUserCount", () =>
        Effect.succeed({
          number: 1000,
        }),
      ),
);

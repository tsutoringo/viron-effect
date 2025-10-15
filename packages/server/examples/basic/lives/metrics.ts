import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { SampleHttpApi } from "../api";

/**
 * Metrics group handlers implementation
 */
export const SampleMetricsGroupLive = HttpApiBuilder.group(
  SampleHttpApi,
  "Metrics",
  (handlers) =>
    handlers.handle("getActiveUserCount", () =>
      Effect.succeed({
        number: 42,
      }),
    ),
);

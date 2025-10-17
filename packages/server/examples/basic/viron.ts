import { Layer } from "effect";
import { VironEffect } from "../../src/lib";
import { SampleVironServer } from "./api";
import { SampleMetricsGroupLive, SampleUserGroupLive } from "./lives";
import { UserDashboardPage } from "./pages/user-dashboard";

/**
 * Viron configuration layer for the Sample API
 */
export const SampleHttpApiWithViron = VironEffect.layer(SampleVironServer, {
  pages: [
    VironEffect.Page.Group({
      group: "Samples",
      child: [UserDashboardPage],
    }),
  ],
}).pipe(
  Layer.provide(SampleUserGroupLive),
  Layer.provide(SampleMetricsGroupLive),
);

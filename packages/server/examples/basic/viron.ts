import { Layer } from "effect";
import { VironEffect } from "../../src/lib";
import { SampleHttpApi } from "./api";
import { SampleMetricsGroupLive, SampleUserGroupLive } from "./lives";

/**
 * Viron configuration layer for the Sample API
 */
export const SampleHttpApiWithViron = VironEffect.layer(SampleHttpApi, {
  pages: VironEffect.Page.Group({
    group: "Samples",
    child: [
      VironEffect.Page.Item({
        id: "user-dashboard",
        title: "ユーザーダッシュボード",
        description: "Example Viron page wiring user endpoints",
        contents: [
          {
            type: "number",
            title: "Active Users",
            endpoint: "Metrics.getActiveUserCount",
            resourceId: "Metrics",
          },
          {
            type: "table",
            title: "All Users",
            endpoint: "User.listUsers",
            resourceId: "User",
          },
        ],
      }),
    ],
  }),
}).pipe(
  Layer.provide(SampleUserGroupLive),
  Layer.provide(SampleMetricsGroupLive),
);

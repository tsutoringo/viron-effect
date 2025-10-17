import type { ApiGroups } from "../../../src/helper/ApiGroups";
import { VironEffect } from "../../../src/lib";
import type { SampleVironServer } from "../api";

export const UserDashboardPage = VironEffect.Page.Item<
  ApiGroups<typeof SampleVironServer>
>({
  id: "user-dashboard",
  title: "ユーザーダッシュボード",
  description: "Example Viron page wiring user endpoints",
  contents: [
    {
      type: "number",
      title: "Total User",
      endpoint: "Metrics.getTotalUserCount",
      resourceId: "Metrics",
    },
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
});

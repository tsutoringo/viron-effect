import { createServer } from "node:http";
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer, Schema } from "effect";
import { VironEffect } from "../src/lib";
import { VironTableContent } from "../src/schema";

const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
});

export const SampleHttpApi = HttpApi.make("SampleApi")
  .annotate(OpenApi.Description, "Viron Effect Sample API")
  .annotate(OpenApi.Servers, [
    {
      url: "/",
    },
  ])
  .add(
    HttpApiGroup.make("User")
      .add(
        HttpApiEndpoint.get(
          "getUser",
        )`/users/${HttpApiSchema.param("id", Schema.String)}`.addSuccess(
          UserSchema,
        ),
      )
      .add(
        HttpApiEndpoint.get("listUsers")`/users`.addSuccess(
          VironTableContent(UserSchema),
        ),
      ),
  )
  .add(
    HttpApiGroup.make("Metrics").add(
      HttpApiEndpoint.get(
        "getActiveUserCount",
      )`/metrics/active-users`.addSuccess(
        Schema.Struct({
          number: Schema.Number,
        }),
      ),
    ),
  );

const SampleUserGroupLive = HttpApiBuilder.group(
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

const SampleMetricsGroupLive = HttpApiBuilder.group(
  SampleHttpApi,
  "Metrics",
  (handlers) =>
    handlers.handle("getActiveUserCount", () =>
      Effect.succeed({
        number: 42,
      }),
    ),
);

export const SampleHttpApiWithViron = VironEffect.make(SampleHttpApi, {
  pages: VironEffect.Page.Group({
    group: "Samples",
    child: [
      VironEffect.Page.Item({
        id: "user-dashboard",
        title: "ユーザーダッシュボード",
        description: "Example Viron page wiring user endpoints",
        contents: [
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

// Set up the server using NodeHttpServer on port 3350
const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: ["https://viron.plus", "https://local.viron.work:8000"],
      credentials: true,
    }),
  ),
  Layer.provide(SampleHttpApiWithViron),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3350 })),
);

// Launch the server
Layer.launch(ServerLive).pipe(NodeRuntime.runMain);

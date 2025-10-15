import { createServer } from "node:http";
import { HttpApiBuilder, HttpLayerRouter } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { SampleHttpApiWithViron } from "./viron";

/**
 * Start the sample server with Viron integration
 * Server will be available at http://localhost:3350
 */
HttpApiBuilder.serve().pipe(
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: ["https://viron.plus", "https://local.viron.work:8000"],
      credentials: true,
    }),
  ),
  Layer.provide(SampleHttpApiWithViron),
  HttpLayerRouter.serve,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3350 })),
  Layer.launch,
  NodeRuntime.runMain,
);

import {
  type HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  HttpServerResponse,
  OpenApi,
} from "@effect/platform";
import { Context, Effect, Layer, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { getEndpointByEndpointIdentifier } from "./endpoint";
import { getEndpointOperationId } from "./helper/endpointOperationId";
import { type Page, walkPages } from "./page";

type VironEffectConfig<Group extends HttpApiGroup.HttpApiGroup.Any> = {
  pages: Page<Group>;
};

const VironGroup = HttpApiGroup.make("Viron")
  .add(
    HttpApiEndpoint.get("getOpenApi")`/oas`.addSuccess(
      Schema.String.pipe(
        HttpApiSchema.withEncoding({
          kind: "Json",
          contentType: "application/json",
        }),
      ),
    ),
  )
  .add(
    HttpApiEndpoint.get("authentication")`/authentication`.addSuccess(
      Schema.String.pipe(
        HttpApiSchema.withEncoding({
          kind: "Json",
          contentType: "application/json",
        }),
      ),
    ),
  );

/**
 * @example
 * ```typescript
 * export const SampleHttpApi = HttpApi.make("SampleApi")
 *   .add(
 *     HttpApiGroup.make("User")
 *       .add(
 *         HttpApiEndpoint.get("getUser")`/user/:id`.addSuccess(
 *           Schema.Struct({
 *             id: Schema.String,
 *             name: Schema.String,
 *           }),
 *         ),
 *       ),
 *   ).add(
 *     HttpApiGroup.make("Post")
 *       .add(
 *         HttpApiEndpoint.get("getPost")`/post/:id`.addSuccess(
 *           Schema.Struct({
 *             id: Schema.String,
 *             title: Schema.String,
 *             content: Schema.String,
 *           }),
 *         ),
 *       ).add(
 *         HttpApiEndpoint.post("createPost")`/post`.addSuccess(
 *           Schema.Struct({
 *             id: Schema.String,
 *             title: Schema.String,
 *             content: Schema.String,
 *           }),
 *         ),
 *       ),
 *   );
 *
 * ```
 */
export const make: {
  <Groups extends HttpApiGroup.HttpApiGroup.Any = never>(
    vironEffectConfig: VironEffectConfig<Groups>,
  ): <Id extends string, E = never, R = never>(
    self: HttpApi.HttpApi<Id, Groups, E, R>,
  ) => ReturnType<typeof HttpApiBuilder.api<Id, Groups, E, R>>;

  <
    Id extends string,
    Groups extends HttpApiGroup.HttpApiGroup.Any = never,
    E = never,
    R = never,
  >(
    self: HttpApi.HttpApi<Id, Groups, E, R>,
    vironEffectConfig: VironEffectConfig<Groups>,
  ): ReturnType<typeof HttpApiBuilder.api<Id, Groups, E, R>>;
} = dual(
  2,
  <
    Id extends string,
    Groups extends HttpApiGroup.HttpApiGroup.Any = never,
    E = never,
    R = never,
  >(
    self: HttpApi.HttpApi<Id, Groups, E, R>,
    vironEffectConfig: VironEffectConfig<Groups>,
  ): ReturnType<typeof HttpApiBuilder.api<Id, Groups, E, R>> => {
    const WithVironServer = self.add(VironGroup).pipe((api) => {
      return api.annotate(OpenApi.Transform, (originalSpec) => {
        const spec = Context.getOption(api.annotations, OpenApi.Transform).pipe(
          Option.map((f) => f(originalSpec)),
          Option.getOrElse(() => originalSpec),
        );

        const pages = buildVironConfig(
          self as unknown as HttpApi.HttpApi.AnyWithProps,
          vironEffectConfig,
        );

        return {
          ...spec,
          openapi: "3.0.2",
          info: {
            ...spec.info,
            "x-pages": pages.toArray(),
            "x-table": {
              responseListKey: "list",
            },
          },
        };
      });
    });

    const openApi = OpenApi.fromApi(WithVironServer);

    const VironLive = HttpApiBuilder.group(
      WithVironServer as unknown as HttpApi.HttpApi<
        Id,
        typeof VironGroup,
        E,
        R
      >,
      "Viron",
      (handlers) =>
        handlers
          .handle("getOpenApi", () =>
            HttpServerResponse.json(openApi, {
              headers: {
                "x-viron-authtypes-path": "/authentication",
                "access-control-expose-headers": "x-viron-authtypes-path",
              },
            }).pipe(Effect.orDie),
          )
          .handle("authentication", () =>
            HttpServerResponse.json({
              list: [],
              oas: {
                openapi: "3.0.2",
                info: {
                  title: "authentication",
                  version: "mock",
                  "x-pages": [],
                },
                paths: {},
              },
            }).pipe(Effect.orDie),
          ),
    );

    const api = HttpApiBuilder.api(WithVironServer).pipe(
      Layer.provide(VironLive),
    );

    return api;
  },
);

const buildVironConfig = (
  api: HttpApi.HttpApi.AnyWithProps,
  vironConfig: VironEffectConfig<HttpApiGroup.HttpApiGroup.Any>,
) => {
  const pages = walkPages([], vironConfig.pages).map(({ path, page }) => {
    return {
      id: page.id,
      title: page.title,
      description: page.description,
      group: path.join("/"),
      contents: page.contents.map((content) => {
        const [group, endpoint] = getEndpointByEndpointIdentifier(
          api.groups,
          content.endpoint,
        ).pipe(Option.getOrThrow);
        const operationId = getEndpointOperationId(group, endpoint);

        return {
          type: content.type,
          title: content.title,
          resourceId: content.resourceId,
          operationId,
        };
      }),
    };
  });

  return pages;
};

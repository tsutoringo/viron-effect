import {
  type HttpApi,
  HttpApiBuilder,
  type HttpApiGroup,
  HttpServerResponse,
  OpenApi,
} from "@effect/platform";
import { Router } from "@effect/platform/HttpApiBuilder";
import type { PathInput } from "@effect/platform/HttpRouter";
import { Context, Effect, Layer, Option } from "effect";
import { getEndpointByIdentifier } from "./endpoint";
import { getEndpointOperationId } from "./helper/endpointOperationId";
import { type Page, walkPages } from "./page";

type VironEffectConfig<Group extends HttpApiGroup.HttpApiGroup.Any> = {
  path?: {
    oas?: PathInput;
    auth?: PathInput;
  };
  pages: Page<Group>[];
};

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
export const layer = <
  Id extends string = string,
  Groups extends HttpApiGroup.HttpApiGroup.Any = never,
  E = never,
  R = never,
>(
  api: HttpApi.HttpApi<Id, Groups, E, R>,
  vironEffectConfig: VironEffectConfig<Groups>,
): Layer.Layer<
  HttpApi.Api,
  never,
  | HttpApiGroup.HttpApiGroup.ToService<Id, Groups>
  | R
  | HttpApiGroup.HttpApiGroup.ErrorContext<Groups>
> =>
  Effect.gen(function* () {
    const WithVironServer = api.pipe((api) => {
      return api.annotate(OpenApi.Transform, (originalSpec) => {
        const spec = Context.getOption(api.annotations, OpenApi.Transform).pipe(
          Option.match({
            onSome: (f) => f(originalSpec),
            onNone: () => originalSpec,
          }),
        );

        const pages = buildVironConfig(
          api as unknown as HttpApi.HttpApi.AnyWithProps,
          vironEffectConfig,
        );

        return {
          ...spec,
          // Viron が Effectの生成する3.1.x系に対応していないため
          openapi: "3.0.2",
          info: {
            ...spec.info,
            "x-pages": pages.toArray(),
            "x-table": {
              responseListKey: "list",
            },
            "x-number": {
              responseKey: "number",
            },
          },
        };
      });
    });

    const openApi = OpenApi.fromApi(WithVironServer);

    const { oas: oasPath = "/oas", auth: authPath = "/authentication" } =
      vironEffectConfig.path ?? {};

    const router = Router.use((router) =>
      Effect.gen(function* () {
        yield* router
          .get(
            oasPath,
            HttpServerResponse.json(openApi, {
              headers: {
                "x-viron-authtypes-path": authPath,
                "access-control-expose-headers": "x-viron-authtypes-path",
              },
            }),
          )
          .pipe(Effect.orDie);

        yield* router
          .get(
            authPath,
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
            }),
          )
          .pipe(Effect.orDie);
      }),
    );

    return Layer.mergeAll(HttpApiBuilder.api(api), router);
  }).pipe(Layer.unwrapEffect);

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
        const [group, endpoint] = getEndpointByIdentifier(
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

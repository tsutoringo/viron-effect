import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "@effect/platform";
import { Schema } from "effect";
import { VironNumberContent, VironTableContent } from "../../src/schema";

/**
 * User schema definition
 */
export const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
});

/**
 * Sample HTTP API definition
 */
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
    HttpApiGroup.make("Metrics")
      .add(
        HttpApiEndpoint.get("getActiveUserCount")`/active-users`.addSuccess(
          VironNumberContent,
        ),
      )
      .add(
        HttpApiEndpoint.get("getTotalUserCount")`/total-users`.addSuccess(
          VironNumberContent,
        ),
      )
      .prefix("/metrics"),
  );

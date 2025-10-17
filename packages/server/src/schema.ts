import { Schema } from "effect";

export const VironTableContent = <Value extends Schema.Schema.Any>(
  list: Value,
) =>
  Schema.Struct({
    list: Schema.Array(list),
  });

export const VironNumberContent = Schema.Struct({
  number: Schema.Number,
});

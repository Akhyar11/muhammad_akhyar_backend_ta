import { Schema } from "../../firebaseORM/assets/type";

export const validateData = (schema: Schema, data: any) => {
  const validate = (obj: any, schema: any) => {
    for (const key in schema) {
      if (typeof schema[key] === "object") {
        if (!validate(obj[key], schema[key])) {
          return { message: `Invalid data at ${key}` }; // give a message
        }
      } else if (typeof obj[key] !== schema[key]) {
        return {
          message: `Invalid type for ${key}. Expected ${
            schema[key]
          }, got ${typeof obj[key]}`,
        };
      }
    }
    return true;
  };

  const validationResult = validate(data, schema);
  if (validationResult !== true) {
    return validationResult;
  }
  return true;
};

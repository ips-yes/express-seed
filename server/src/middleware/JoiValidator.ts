import * as Joi from 'joi';
import { badRequest } from 'boom';

interface IOptions {
    abortEarly?: boolean;
}

function validate(schema: {[key: string]: any}, options?: IOptions) {
  const _options = options || {};
  _options.abortEarly = false;
  return function validateRequest(req, res, next) {
    const toValidate: Map<string, any> = new Map<string, any>();
    if (!schema) {
      next();
    }

    ['params', 'body', 'query'].forEach((key: string) => {
      if (schema[key]) {
        toValidate[key] = req[key];
      }
    });

    function onValidationComplete(err, validated) {
      if (err) {
        return next(badRequest(err.message, err.details));
      }

      // copy the validated data to the req object
      Object.assign(req, validated);

      return next();
    }

    return Joi.validate(toValidate, schema, _options, onValidationComplete);
  };
}

export default validate;

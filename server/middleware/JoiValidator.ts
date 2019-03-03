/*Created by anthonyg 27-02-2019*/
import * as Joi from 'joi'
import {badRequest} from 'Boom';

interface IOptions {
    abortEarly?: boolean;
}

export function validate(schema: {[key: string]: any}, options?: IOptions) {
    options = options || {};
    options.abortEarly = false;
    return function validateRequest(req, res, next) {
        let toValidate: Map<string, any> = new Map<string, any>();
        if (!schema) {
            next();
        }

        ['params', 'body', 'query'].forEach((key: string) =>  {
            if (schema[key]) {
                toValidate[key] = req[key];
            }
        });

        return Joi.validate(toValidate, schema, options, onValidationComplete);

        function onValidationComplete(err, validated) {
            if (err) {
                return next(badRequest(err.message, err.details));
            }

            // copy the validated data to the req object
            Object.assign(req, validated);

            return next();
        }
    };
}

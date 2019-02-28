/*Created by anthonyg 27-02-2019*/
const Joi = require('joi'),
  Boom = require('boom'),
  Extend = require('extend');

    function validate(schema, options){
        options = options || {};
        options.abortEarly = false;
        return function validateRequest(req, res, next){
            let toValidate = {};
            if(!schema){
                next();
            }

            ['params', 'body', 'query'].forEach(function (key) {
                if (schema[key]) {
                    toValidate[key] = req[key];
                }
            });

            return Joi.validate(toValidate, schema, options, onValidationComplete);

            function onValidationComplete(err, validated) {
                if (err) {
                    return next(Boom.badRequest(err.message, err.details));
                }

                // copy the validated data to the req object
                Extend(req, validated);

                return next();
            }

        };
    }

    exports.validate = validate;
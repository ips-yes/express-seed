import * as Joi from 'joi';

// eslint-disable-next-line max-len
const PASSWORD_REGEX = /(?=^.{8,32}$)(?=(?:.*?\d){1})(?=.*[a-z])(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%^&*]*$/;
const PASSWORD_MESSAGE = '"password" must be between 8 and 32 characters, and contain atleast:'
 + 'one uppercase letter, one lowercase letter, one number, and one special character.';

export default {
  PostUser: {
    body: {
      createdBy: Joi.number(),
      email: Joi.string().lowercase().email().required(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      // password requirements
      // 8 characters
      // One Upper Case
      // One Lower Case
      // One Number
      // One Special character
      password: Joi.string().regex(PASSWORD_REGEX).required().error(() => PASSWORD_MESSAGE),
      userTypeId: Joi.number().required(),
    },
  },

  GetUser: {
    params: {
      id: Joi.number().required(),
    },
  },

  Login: {
    body: {
      username: Joi.string().lowercase().email().required(),
      password: Joi.string().required(),
    },
  },
};

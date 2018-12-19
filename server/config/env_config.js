require('dotenv').config();
const Joi = require('joi');

const envVarsSchema = Joi.object({
  APP_NAME : Joi.string(),
  APP_PORT: Joi.number().required(),
  VERSION: Joi.string(),
  ADDRESS: Joi.string().required(),
  API_PATH: Joi.string().required(),
  HTTP: Joi.string().required(),
  COOKIE_LIFE: Joi.number().required(),
  BCRYPT_COST_FACTOR: Joi.number().required(),
  RECOVERY_LIFE: Joi.number().required(),
  MAX_SESSIONS: Joi.number().required(),
  STALE_SESSION_TIME_TO_LIVE_IN_DAYS: Joi.number().required(),
  SESSION_CLEANUP_FREQUENCY_IN_DAYS: Joi.number().required(),
  RATE_ENABLE: Joi.boolean().required(),
  RATE_WINDOW_MS: Joi.number().required(),
  RATE_MAX: Joi.number().required(),
  RATE_DELAY_MS: Joi.number().required(),
  DB_VERSION: Joi.number().required(),
  NODE_ENV: Joi.string()
    .allow(['development', 'staging', 'production', 'test', 'provision'])
    .default('development'),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string()
    .required()
    .allow(''),
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_SYNC: Joi.boolean().required()
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  "env": envVars.NODE_ENV,
  "app": {
    "name": envVars.APP_NAME,
    "port": envVars.APP_PORT,
    "version": envVars.VERSION,
    "address": envVars.ADDRESS,
    "path": envVars.API_PATH,
    "http": envVars.HTTP
  },
  "auth": {
    "cookieLife": envVars.COOKIE_LIFE,
    "bcrypt": {
      "costFactor": envVars.BCRYPT_COST_FACTOR
    },
    "recoveryLife": envVars.RECOVERY_LIFE,
    "maxSessions": envVars.MAX_SESSIONS
  },
  "limiter": {
    "enable": envVars.RATE_ENABLE,
    "windowMS": envVars.RATE_WINDOW_MS,
    "max": envVars.RATE_MAX,
    "delayMs": envVars.RATE_DELAY_MS
  },
  "db": {
    "version": envVars.DB_VERSION,
    "host": envVars.DB_HOST,
    "name": envVars.DB_NAME,
    "username": envVars.DB_USERNAME,
    "password": envVars.DB_PASSWORD,
    "sync": envVars.DB_SYNC
  },
  "sessionLife": {
    "staleSessionTimeToLiveInDays": envVars.STALE_SESSION_TIME_TO_LIVE_IN_DAYS,
    "sessionCleanupFrequencyInDays": envVars.SESSION_CLEANUP_FREQUENCY_IN_DAYS
  }
};

module.exports = config;
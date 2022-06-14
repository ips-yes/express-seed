import dotenv from 'dotenv';
import { IConfig } from './IConfig';

dotenv.config();

const envVars = process.env;

const config : IConfig = {
  app: {
    NAME: envVars.APP_NAME,
    PORT: +envVars.APP_PORT,
    PORT_SECURE: +envVars.PORT_SECURE,
    CLIENT_PORT: envVars.APP_CLIENT_PORT,
    VERSION: envVars.VERSION,
    ADDRESS: envVars.ADDRESS,
    PATH: envVars.API_PATH,
    HTTP: envVars.HTTP,
  },
  auth: {
    cookieLife: +envVars.COOKIE_LIFE,
    bcrypt: {
      costFactor: +envVars.BCRYPT_COST_FACTOR,
    },
    recoveryLife: +envVars.RECOVERY_LIFE,
    maxSessions: +envVars.MAX_SESSIONS,
  },
  limiter: {
    enable: Boolean(envVars.RATE_ENABLE),
    windowMS: +envVars.RATE_WINDOW_MS,
    max: +envVars.RATE_MAX,
    delayMs: +envVars.RATE_DELAY_MS,
  },
  db: {
    VERSION: envVars.DB_VERSION,
    HOST: envVars.RDS_HOSTNAME,
    NAME: envVars.RDS_DB_NAME,
    USER: envVars.RDS_USERNAME,
    PASSWORD: envVars.RDS_PASSWORD,
    SYNC: Boolean(envVars.DB_SYNC),
  },
  sessionLife: {
    staleSessionTimeToLiveInDays: +envVars.STALE_SESSION_TIME_TO_LIVE_IN_DAYS,
    sessionCleanupFrequencyInDays: +envVars.SESSION_CLEANUP_FREQUENCY_IN_DAYS,
  },
};

export default config;

import { IConfig } from './IConfig';
import * as dev from './dev.json';
import * as stage from './stage.json';

const seedEnvironment = process.env.SEED_ENVIRONMENT || 'dev';
const config: IConfig = seedEnvironment === 'dev' ? dev : stage;

export default config;

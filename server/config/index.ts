import { IConfig } from "./IConfig";

let seedEnvironment = process.env.SEED_ENVIRONMENT || 'dev';
import * as dev from './dev.json'
import * as stage from './stage.json'
export const config: IConfig = seedEnvironment === 'dev' ? dev : stage;


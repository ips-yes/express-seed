import isDocker from 'is-docker';
import { IConfig } from './IConfig';
import * as dev from './dev.json';
import * as stage from './stage.json';
import * as docker from './docker.json';

const seedEnvironment = process.env.SEED_ENVIRONMENT || 'dev';
const config : IConfig = isDocker() ? docker : seedEnvironment === 'dev' ? dev : stage; 

export default config;

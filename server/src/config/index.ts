import isDocker from 'is-docker';
import { IConfig } from './IConfig';
import * as dev from '../../config/dev.json';
import * as stage from '../../config/stage.json';
import * as docker from '../../config/docker.json';

const seedEnvironment = process.env.SEED_ENVIRONMENT || 'dev';
const config : IConfig = isDocker() ? docker : seedEnvironment === 'dev' ? dev : stage; 

export default config;

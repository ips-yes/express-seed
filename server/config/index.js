let seedEnvironment = process.env.SEED_ENVIRONMENT || 'dev';
module.exports = require('./' + seedEnvironment);
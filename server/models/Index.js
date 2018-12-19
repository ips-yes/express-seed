/**
 * Created by anthonyg on 8/19/2016.
 */
let config = require('../config/env_config');
let Sequelize = require('sequelize'),
    fs = require('fs'),
    path = require('path'),
    DB_PARAMS = config.db,
    modelsDir = path.join(__dirname, '..', 'models'),
    db = {};
let sequelize = new Sequelize(DB_PARAMS.name, DB_PARAMS.username, DB_PARAMS.password, {
    host: DB_PARAMS.host,
    dialect: 'postgres',
    logging: false,
    operatorsAliases: false,
    define: {
        underscored: true,
        timestamps: true,
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }

});

fs
    .readdirSync(modelsDir)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "Index.js");
    })
    .forEach(function (file) {
        let model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
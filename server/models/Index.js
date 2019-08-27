/**
 * Created by anthonyg on 8/19/2016.
 */
let Sequelize = require('sequelize'),
    fs = require('fs'),
    path = require('path'),
    DB_PARAMS = require('../config').db,
    modelsDir = path.join(__dirname, '..', 'models'),
    db = {};
let sequelize = new Sequelize(DB_PARAMS.NAME, DB_PARAMS.USER, DB_PARAMS.PASSWORD, {
    host: DB_PARAMS.HOST,
    dialect: 'postgres',
    logging: false,
    define: {
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
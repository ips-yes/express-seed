/**
 * Created by anthonyg on 8/19/2016.
 */
import * as Sequelize from 'sequelize'
import * as fs from 'fs'
import * as path from 'path';
import { config } from '../config';

const DB_PARAMS = config.db;
const modelsDir = path.join(__dirname, '..', 'models');

interface IDBModels {
    sequelize?: Sequelize.Sequelize
    Sequelize?: any
    [modelName: string]: any;
}
let db: IDBModels = {};

let sequelize = new Sequelize(DB_PARAMS.NAME, DB_PARAMS.USER, DB_PARAMS.PASSWORD, {
    host: DB_PARAMS.HOST,
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
        return (file.indexOf(".") !== 0) && (file !== "Index.js") && (!file.endsWith(".ts"));
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

export default db;

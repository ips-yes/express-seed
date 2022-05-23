/* jshint indent: 2 */
module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define('users', {
            deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            editedBy: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            firstName: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            lastName: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            userTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            phoneNumber:{
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            tableName: 'users',
        });

    User.associate = models=>{
        User.belongsTo(models.userTypes,{
            foreignKey: 'userTypeId',
        })
    };
        return User;
};



/* jshint indent: 2 */
module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define('users', {
            deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            edited_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            _id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            first_name: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            last_name: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            user_type_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            phone_number:{
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            tableName: 'users',
        });

    User.associate = models=>{
        User.belongsTo(models.user_types,{
            foreignKey: 'user_type_id'
        })
    };
        return User;
};



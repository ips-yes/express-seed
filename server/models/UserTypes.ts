/* jshint indent: 2 */
module.exports = (sequelize, DataTypes)=>{
  const UserType = sequelize.define('user_types', {
      _id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
      },
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
      value: {
          type: DataTypes.TEXT,
          allowNull: true
      }
  },
      {
          tableName: 'user_types'
      });

  UserType.associate = models=>{
  };
  return UserType;
};

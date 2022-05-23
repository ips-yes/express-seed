/* jshint indent: 2 */
module.exports = (sequelize, DataTypes)=>{
  const UserType = sequelize.define('userTypes', {
      id: {
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
      createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true
      },
      editedBy: {
          type: DataTypes.INTEGER,
          allowNull: true
      },
      value: {
          type: DataTypes.TEXT,
          allowNull: true
      }
  },
      {
          tableName: 'userTypes'
      });

  UserType.associate = models=>{
  };
  return UserType;
};
/* jshint indent: 2 */
module.exports = (sequelize, DataTypes)=>{
  const Session = sequelize.define('sessions',{
      uuid: {
          type: DataTypes.TEXT,
          allowNull: false,
          primaryKey: true
      },
      expiresAt: {
          type: DataTypes.DATE,
          allowNull: true
      },
      active: {
          type: DataTypes.BOOLEAN,
          allowNull: true
      },
      expired: {
          type: DataTypes.BOOLEAN,
          allowNull: true
      },
      userId: {
          type: DataTypes.INTEGER,
          allowNull: true
      }
  },{
          tableName: 'sessions'
  });
    Session.associate = models=>{
        Session.belongsTo(models.users,{
            foreignKey: 'userId'
        })
    };
    return Session;
};

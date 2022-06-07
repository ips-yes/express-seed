import { Model } from 'sequelize';

interface SessionAttributes {
  uuid: String; // Sequelize.DataTypes.UUID?
  expiresAt: Date;
  active: Boolean;
  expired: Boolean;
  userId: Number
}

export = (sequelize: any, DataTypes: any) => {
  class Session extends Model<SessionAttributes>
    implements SessionAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     uuid!: String; // Sequelize.DataTypes.UUID?

     expiresAt!: Date;

     active!: Boolean;

     expired!: Boolean;

     userId!: Number

     static associate(models: any) {
       Session.belongsTo(models.User, {
         foreignKey: 'userId',
       });
     }
  }

  Session.init({
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Session',
    // paranoid: true
  });

  return Session;
};

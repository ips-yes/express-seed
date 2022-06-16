import { Model } from 'sequelize';

interface UserAttributes {
    id: Number;
    deleted: Boolean;
    createdBy: Number;
    editedBy: Number;
    email: String;
    firstName: String;
    lastName: String;
    password: String;
    phoneNumber: String;
    userTypeId: Number;
}

export = (sequelize: any, DataTypes: any) => {
  class User extends Model<UserAttributes>
    implements UserAttributes {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     id!: Number;

     deleted!: Boolean;

     createdBy!: Number;

     editedBy!: Number;

     email!: String;

     firstName!: String;

     lastName!: String;

     password!: String;

     phoneNumber!: String;

     userTypeId!: Number;

     static associate(models: any) {
       User.belongsTo(models.UserType, {
         foreignKey: 'userTypeId',
       });
     }
  }

  User.init({
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    editedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true,
  });

  return User;
};

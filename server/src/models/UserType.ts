import { Model } from 'sequelize';

interface UserTypeAttributes {
  id: Number;
  value: String;
  deleted: Number;
  createdBy: Number;
  editedBy: Number;
}

export = (sequelize: any, DataTypes: any) => {
  class UserType extends Model<UserTypeAttributes>
    implements UserTypeAttributes {
    /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
       id!: Number;

       value!: String;

       deleted!: Number;

       createdBy!: Number;

       editedBy: Number;

       static associate(models: any) {
         // ...
       }
  }

  UserType.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
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
    value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'UserType',
    paranoid: true,
  });

  return UserType;
};

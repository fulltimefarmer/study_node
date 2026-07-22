import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface UserRoleAttributes {
  userId: number;
  roleId: number;
}

class UserRole extends Model<UserRoleAttributes> {}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    modelName: 'UserRole',
    timestamps: false,
  }
);

export default UserRole;

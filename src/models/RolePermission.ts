import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface RolePermissionAttributes {
  roleId: number;
  permissionId: number;
}

class RolePermission extends Model<RolePermissionAttributes> {}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    modelName: 'RolePermission',
    timestamps: false,
  }
);

export default RolePermission;

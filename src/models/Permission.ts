import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PermissionAttributes {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId: number | null;
  path: string;
  icon: string;
  sort: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'parentId' | 'path' | 'icon' | 'sort' | 'createdAt' | 'updatedAt'> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('menu', 'button', 'api'),
      defaultValue: 'menu',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    path: {
      type: DataTypes.STRING(255),
      defaultValue: '',
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: '',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    modelName: 'Permission',
  }
);

export default Permission;

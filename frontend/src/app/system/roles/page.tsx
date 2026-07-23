'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { getIcon, formatDate } from '@/lib/utils';
import { Role, Permission } from '@/types';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permTree, setPermTree] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissionIds: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermTree();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await api<Role[]>('/roles');
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPermTree = async () => {
    try {
      const data = await api<Permission[]>('/permissions/tree');
      setPermTree(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      permissionIds: [],
    });
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该角色吗？')) return;
    try {
      await api(`/roles/${id}`, { method: 'DELETE' });
      loadRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      alert('请填写角色名称和编码');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRole) {
        await api(`/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await api('/roles', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }

      setModalOpen(false);
      loadRoles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (permId: number, withChildren: boolean = false) => {
    const findNode = (nodes: Permission[]): Permission | null => {
      for (const n of nodes) {
        if (n.id === permId) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(permTree);
    const collectIds = (n: Permission): number[] => {
      let ids = [n.id];
      if (n.children) {
        for (const c of n.children) {
          ids = ids.concat(collectIds(c));
        }
      }
      return ids;
    };

    const isChecked = formData.permissionIds.includes(permId);
    let newIds: number[];

    if (withChildren && node) {
      const childIds = collectIds(node);
      if (isChecked) {
        newIds = formData.permissionIds.filter(id => !childIds.includes(id));
      } else {
        newIds = [...new Set([...formData.permissionIds, ...childIds])];
      }
    } else {
      if (isChecked) {
        newIds = formData.permissionIds.filter(id => id !== permId);
      } else {
        newIds = [...formData.permissionIds, permId];
      }
    }

    setFormData({ ...formData, permissionIds: newIds });
  };

  const renderPermTree = (nodes: Permission[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          <input
            type="checkbox"
            checked={formData.permissionIds.includes(node.id)}
            onChange={() => togglePermission(node.id, true)}
            className="w-4 h-4"
          />
          <span>{getIcon(node.icon)}</span>
          <span className="text-sm">{node.name}</span>
          <span className={`tag ${node.type === 'menu' ? 'tag-primary' : 'tag-warning'}`}>
            {node.type === 'menu' ? '菜单' : node.type === 'button' ? '按钮' : 'API'}
          </span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="border-l border-gray-100 ml-6">
            {renderPermTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">角色管理</h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
          >
            + 新增角色
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>角色名称</th>
              <th>角色编码</th>
              <th>描述</th>
              <th>权限数量</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && roles.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading && roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                    {role.code}
                  </code>
                </td>
                <td>{role.description || '-'}</td>
                <td>{role.permissions?.length || 0}</td>
                <td>{role.createdAt ? formatDate(role.createdAt) : '-'}</td>
                <td>
                  <span className="action-link" onClick={() => handleEdit(role)}>编辑</span>
                  <span className="action-link danger" onClick={() => handleDelete(role.id)}>删除</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editingRole ? '编辑角色' : '新增角色'}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
        width="w-[600px]"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 角色名称
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 角色编码
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">描述</label>
            <textarea
              className="form-input"
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">权限配置</label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-80 overflow-y-auto">
              {renderPermTree(permTree)}
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

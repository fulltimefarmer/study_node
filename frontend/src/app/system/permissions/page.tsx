'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { getIcon } from '@/lib/utils';
import { Permission } from '@/types';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [menuPerms, setMenuPerms] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'menu' as 'menu' | 'button' | 'api',
    parentId: null as number | null,
    path: '',
    icon: '',
    sort: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const [allPerms, menuList] = await Promise.all([
        api<Permission[]>('/permissions'),
        api<Permission[]>('/permissions?type=menu'),
      ]);
      setPermissions(allPerms);
      setMenuPerms(menuList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildFlatList = (items: Permission[]) => {
    const result: (Permission & { level: number })[] = [];
    const build = (parentId: number | null, level: number) => {
      items
        .filter(i => i.parentId === parentId)
        .sort((a, b) => a.sort - b.sort || a.id - b.id)
        .forEach(item => {
          result.push({ ...item, level });
          build(item.id, level + 1);
        });
    };
    build(null, 0);
    return result;
  };

  const handleAdd = () => {
    setEditingPerm(null);
    setFormData({
      name: '',
      code: '',
      type: 'menu',
      parentId: null,
      path: '',
      icon: '',
      sort: 0,
    });
    setModalOpen(true);
  };

  const handleEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setFormData({
      name: perm.name,
      code: perm.code,
      type: perm.type,
      parentId: perm.parentId,
      path: perm.path,
      icon: perm.icon,
      sort: perm.sort,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该权限吗？')) return;
    try {
      await api(`/permissions/${id}`, { method: 'DELETE' });
      loadPermissions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      alert('请填写权限名称和编码');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        ...formData,
        parentId: formData.parentId || null,
      };

      if (editingPerm) {
        await api(`/permissions/${editingPerm.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/permissions', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);
      loadPermissions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const flatList = buildFlatList(permissions);

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">权限管理</h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
          >
            + 新增权限
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>权限名称</th>
              <th>权限编码</th>
              <th>类型</th>
              <th>路由路径</th>
              <th>图标</th>
              <th>排序</th>
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
            {!loading && flatList.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading && flatList.map(perm => (
              <tr key={perm.id}>
                <td style={{ paddingLeft: `${perm.level * 24 + 16}px` }}>
                  {perm.level > 0 && (
                    <span className="text-gray-300 mr-2">
                      {'　'.repeat(perm.level - 1)}└─
                    </span>
                  )}
                  <span className="mr-2">{getIcon(perm.icon)}</span>
                  {perm.name}
                </td>
                <td>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {perm.code}
                  </code>
                </td>
                <td>
                  <span className={`tag ${perm.type === 'menu' ? 'tag-primary' : perm.type === 'button' ? 'tag-warning' : 'tag-success'}`}>
                    {perm.type === 'menu' ? '菜单' : perm.type === 'button' ? '按钮' : 'API'}
                  </span>
                </td>
                <td>{perm.path || '-'}</td>
                <td>{getIcon(perm.icon)}</td>
                <td>{perm.sort}</td>
                <td>
                  <span className="action-link" onClick={() => handleEdit(perm)}>编辑</span>
                  <span className="action-link danger" onClick={() => handleDelete(perm.id)}>删除</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editingPerm ? '编辑权限' : '新增权限'}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 权限名称
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
              <span className="text-red-500">*</span> 权限编码
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">类型</label>
              <select
                className="form-input"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="menu">菜单</option>
                <option value="button">按钮</option>
                <option value="api">API</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">上级权限</label>
              <select
                className="form-input"
                value={formData.parentId || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    parentId: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">顶级</option>
                {menuPerms
                  .filter(p => !editingPerm || p.id !== editingPerm.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">路由路径</label>
            <input
              type="text"
              className="form-input"
              placeholder="菜单类型可填写"
              value={formData.path}
              onChange={e => setFormData({ ...formData, path: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">图标</label>
              <input
                type="text"
                className="form-input"
                placeholder="setting / user / team 等"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">排序</label>
              <input
                type="number"
                className="form-input"
                value={formData.sort}
                onChange={e => setFormData({ ...formData, sort: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { User, Role, PageResult } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    status: 'active',
    roleIds: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api<PageResult<User>>(
        `/users?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`
      );
      setUsers(data.list);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await api<Role[]>('/roles');
      setRoles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setTimeout(loadUsers, 0);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      status: 'active',
      roleIds: [],
    });
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      status: user.status,
      roleIds: user.roles?.map(r => r.id) || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该用户吗？')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) {
      alert('请填写用户名和邮箱');
      return;
    }
    if (!editingUser && !formData.password) {
      alert('请输入密码');
      return;
    }

    setSubmitting(true);
    try {
      const body: any = {
        username: formData.username,
        email: formData.email,
        status: formData.status,
        roleIds: formData.roleIds,
      };
      if (formData.password) body.password = formData.password;

      if (editingUser) {
        await api(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">用户管理</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="form-input w-56"
              placeholder="搜索用户名/邮箱"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              搜索
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              + 新增用户
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
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
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading && users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {user.roles?.map(r => (
                    <span key={r.id} className="tag tag-primary">
                      {r.name}
                    </span>
                  )) || '-'}
                </td>
                <td>
                  <span className={`tag ${user.status === 'active' ? 'tag-success' : 'tag-danger'}`}>
                    {user.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{user.createdAt ? formatDate(user.createdAt) : '-'}</td>
                <td>
                  <span className="action-link" onClick={() => handleEdit(user)}>编辑</span>
                  <span className="action-link danger" onClick={() => handleDelete(user.id)}>删除</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination total={total} page={page} pageSize={pageSize} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        title={editingUser ? '编辑用户' : '新增用户'}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 用户名
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 邮箱
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {editingUser ? '新密码' : <><span className="text-red-500">*</span> 密码</>}
            </label>
            <input
              type="password"
              className="form-input"
              placeholder={editingUser ? '不修改请留空' : '请输入密码'}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">状态</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">启用</option>
              <option value="disabled">禁用</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">角色</label>
            <div className="flex flex-wrap gap-3">
              {roles.map(role => (
                <label key={role.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="w-4 h-4"
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

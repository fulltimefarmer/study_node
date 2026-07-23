'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Site, PageResult } from '@/types';

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSites();
  }, [page]);

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await api<PageResult<Site>>(
        `/sites?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`
      );
      setSites(data.list);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setTimeout(loadSites, 0);
  };

  const handleAdd = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      domain: '',
      description: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      domain: site.domain,
      description: site.description,
      status: site.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该站点吗？')) return;
    try {
      await api(`/sites/${id}`, { method: 'DELETE' });
      loadSites();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.domain) {
      alert('请填写站点名称和域名');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: formData.name,
        domain: formData.domain,
        description: formData.description,
        status: formData.status,
      };

      if (editingSite) {
        await api(`/sites/${editingSite.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/sites', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);
      loadSites();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">站点管理</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="form-input w-56"
              placeholder="搜索站点名称/域名"
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
              + 新增站点
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>站点名称</th>
              <th>域名</th>
              <th>描述</th>
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
            {!loading && sites.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading && sites.map(site => (
              <tr key={site.id}>
                <td>{site.id}</td>
                <td>{site.name}</td>
                <td>{site.domain}</td>
                <td className="max-w-[200px] truncate">{site.description || '-'}</td>
                <td>
                  <span className={`tag ${site.status === 'active' ? 'tag-success' : 'tag-danger'}`}>
                    {site.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{site.createdAt ? formatDate(site.createdAt) : '-'}</td>
                <td>
                  <span className="action-link" onClick={() => handleEdit(site)}>编辑</span>
                  <span className="action-link danger" onClick={() => handleDelete(site.id)}>删除</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination total={total} page={page} pageSize={pageSize} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        title={editingSite ? '编辑站点' : '新增站点'}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmit}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              <span className="text-red-500">*</span> 站点名称
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
              <span className="text-red-500">*</span> 域名
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">描述</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
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
        </div>
      </Modal>
    </AdminLayout>
  );
}

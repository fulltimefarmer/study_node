'use client';

import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, menus } = useAuth();

  const stats = [
    {
      icon: '👥',
      label: '角色数量',
      value: user?.roles?.length || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '🔑',
      label: '权限数量',
      value: user?.permissionCodes?.length || 0,
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: '📋',
      label: '菜单数量',
      value: menus?.length || 0,
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: '✅',
      label: '账号状态',
      value: user?.status === 'active' ? '正常' : '禁用',
      color: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          欢迎回来，{user?.username}！
        </h1>
        <p className="text-gray-500 mb-10">
          您当前的角色：{user?.roles?.map(r => r.name).join('、') || '无'}
        </p>

        <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

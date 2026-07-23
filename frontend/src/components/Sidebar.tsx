'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getIcon, buildMenuTree } from '@/lib/utils';

export default function Sidebar() {
  const { menus, user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ system: true });

  const menuTree = buildMenuTree(menus || []);

  const toggleMenu = (code: string) => {
    setOpenMenus(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <aside
      className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-700 font-bold text-lg">
        {collapsed ? '📦' : '后台管理系统'}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <Link
          href="/"
          className={`flex items-center px-6 py-3 text-sm hover:bg-slate-800 ${
            pathname === '/' ? 'bg-blue-600' : 'text-slate-300'
          }`}
        >
          <span className="text-lg mr-3 w-5 text-center">🏠</span>
          {!collapsed && <span>首页</span>}
        </Link>

        {menuTree.map(menu => {
          const isOpen = openMenus[menu.code] ?? false;
          const hasActiveChild = menu.children?.some(c => pathname === c.path);

          return (
            <div key={menu.id}>
              <div
                className={`flex items-center px-6 py-3 text-sm cursor-pointer hover:bg-slate-800 ${
                  hasActiveChild ? 'bg-slate-800 text-white' : 'text-slate-300'
                }`}
                onClick={() => toggleMenu(menu.code)}
              >
                <span className="text-lg mr-3 w-5 text-center">
                  {getIcon(menu.icon)}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{menu.name}</span>
                    <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
                  </>
                )}
              </div>
              {!collapsed && isOpen && menu.children && (
                <div className="bg-slate-950">
                  {menu.children.map(child => (
                    <Link
                      key={child.id}
                      href={child.path || '#'}
                      className={`flex items-center pl-14 pr-6 py-2 text-sm hover:bg-slate-800 ${
                        pathname === child.path
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        className="h-12 border-t border-slate-700 hover:bg-slate-800 text-slate-400"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '»' : '« 收起侧边栏'}
      </button>
    </aside>
  );
}

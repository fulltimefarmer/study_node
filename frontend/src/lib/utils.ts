import { Permission } from '@/types';

const iconMap: Record<string, string> = {
  setting: '⚙️',
  user: '👤',
  team: '👥',
  safety: '🔒',
  home: '🏠',
  dashboard: '📊',
  global: '🌐',
};

export function getIcon(name: string): string {
  return iconMap[name] || '📄';
}

export function buildMenuTree(menus: Permission[]): Permission[] {
  const topMenus = menus.filter(m => !m.parentId);
  const children = menus.filter(m => m.parentId);

  return topMenus.map(m => ({
    ...m,
    children: children.filter(c => c.parentId === m.id),
  }));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN');
}

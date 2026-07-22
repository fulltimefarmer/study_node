const API_BASE = '/api';

let state = {
  user: null,
  menus: [],
  currentPage: 'welcome',
  sidebarCollapsed: false,
  userDropdownOpen: false,
};

async function api(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(API_BASE + url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }
    throw new Error(data.message || '请求失败');
  }
  return data;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getIcon(name) {
  const icons = {
    setting: '⚙️',
    user: '👤',
    team: '👥',
    safety: '🔒',
    home: '🏠',
    dashboard: '📊',
  };
  return icons[name] || '📄';
}

function render() {
  const app = document.getElementById('app');
  const hash = window.location.hash || '#/welcome';

  if (hash === '#/login') {
    renderLogin(app);
    return;
  }

  if (!state.user) {
    api('/auth/me')
      .then((data) => {
        state.user = data.user;
        state.menus = data.menus;
        render();
      })
      .catch(() => {
        window.location.hash = '#/login';
      });
    app.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:18px;color:#666;">加载中...</div>';
    return;
  }

  renderLayout(app);
}

function renderLogin(app) {
  app.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <div class="login-title">后台管理系统</div>
        <div class="login-subtitle">Admin Management System</div>
        <form id="loginForm">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" id="username" placeholder="请输入用户名" value="admin" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" id="password" placeholder="请输入密码" value="123456" />
          </div>
          <div id="loginError" class="error-message"></div>
          <button type="submit" class="login-btn">登 录</button>
        </form>
        <div class="login-tips">
          <p>💡 测试账号：</p>
          <p>超级管理员：admin / 123456</p>
          <p>管理员：manager / 123456</p>
          <p>普通用户：user / 123456</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
      errorEl.textContent = '';
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      state.user = null;
      window.location.hash = '#/welcome';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

function renderLayout(app) {
  const hash = window.location.hash || '#/welcome';
  const page = hash.replace('#/', '') || 'welcome';
  state.currentPage = page;

  app.innerHTML = `
    <div class="layout">
      <div class="sidebar ${state.sidebarCollapsed ? 'collapsed' : ''}">
        <div class="sidebar-logo">${state.sidebarCollapsed ? '📦' : '后台管理系统'}</div>
        <div class="sidebar-menu" id="sidebarMenu">
          ${renderMenuItems()}
        </div>
      </div>
      <div class="main-content">
        <div class="header">
          <div class="header-left">
            <div class="toggle-btn" id="toggleSidebar">${state.sidebarCollapsed ? '☰' : '☰'}</div>
            <div class="breadcrumb">${getBreadcrumb()}</div>
          </div>
          <div class="header-right">
            <div class="dropdown">
              <div class="user-info" id="userDropdownBtn">
                <div class="user-avatar">${state.user.username.charAt(0).toUpperCase()}</div>
                <span class="user-name">${state.user.username}</span>
                <span style="margin-left:4px;">▼</span>
              </div>
              <div class="dropdown-menu ${state.userDropdownOpen ? 'show' : ''}" id="userDropdownMenu">
                <div class="dropdown-item">个人中心</div>
                <div class="dropdown-item">修改密码</div>
                <div class="dropdown-item danger" id="logoutBtn">退出登录</div>
              </div>
            </div>
          </div>
        </div>
        <div class="content-area" id="contentArea">
          ${renderPage(page)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('toggleSidebar').addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    render();
  });

  document.getElementById('userDropdownBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    state.userDropdownOpen = !state.userDropdownOpen;
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    if (state.userDropdownOpen) {
      state.userDropdownOpen = false;
      const menu = document.getElementById('userDropdownMenu');
      if (menu) menu.classList.remove('show');
    }
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch (e) {}
      state.user = null;
      state.menus = [];
      window.location.hash = '#/login';
    });
  }

  initPageLogic(page);
}

function renderMenuItems() {
  const topMenus = state.menus.filter((m) => !m.parentId);
  const children = state.menus.filter((m) => m.parentId);

  let html = '';

  html += `
    <a class="menu-item ${state.currentPage === 'welcome' ? 'active' : ''}" href="#/welcome">
      <span class="menu-icon">🏠</span>
      ${state.sidebarCollapsed ? '' : '<span>首页</span>'}
    </a>
  `;

  for (const menu of topMenus) {
    const subItems = children.filter((c) => c.parentId === menu.id);
    const isActive = subItems.some((s) => state.currentPage === s.path.replace('/', '').replace('/', ''));

    html += `
      <div class="menu-group">
        <div class="menu-item ${isActive ? 'active' : ''}" data-toggle="${menu.code}">
          <span class="menu-icon">${getIcon(menu.icon)}</span>
          ${state.sidebarCollapsed ? '' : `
            <span style="flex:1;">${menu.name}</span>
            <span style="font-size:12px;">${isActive ? '▼' : '▶'}</span>
          `}
        </div>
        <div class="submenu ${isActive ? 'open' : ''}" data-submenu="${menu.code}">
          ${subItems.map((item) => {
            const pageKey = item.path.replace(/^\//, '').replace(/\//g, '-');
            return `
              <a class="menu-item ${state.currentPage === pageKey ? 'active' : ''}" href="${item.path ? '#' + item.path : '#'}">
                ${state.sidebarCollapsed ? '' : item.name}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  setTimeout(() => {
    document.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const code = el.getAttribute('data-toggle');
        const submenu = document.querySelector(`[data-submenu="${code}"]`);
        if (submenu) submenu.classList.toggle('open');
      });
    });
  }, 0);

  return html;
}

function getBreadcrumb() {
  const page = state.currentPage;
  if (page === 'welcome') return '首页';

  const children = state.menus.filter((m) => m.parentId);
  const current = children.find((c) => c.path.replace(/^\//, '').replace(/\//g, '-') === page);
  if (current) {
    const parent = state.menus.find((m) => m.id === current.parentId);
    return `${parent ? parent.name + ' / ' : ''}${current.name}`;
  }
  return '';
}

function renderPage(page) {
  switch (page) {
    case 'welcome':
      return renderWelcome();
    case 'system-users':
      return renderUserManagement();
    case 'system-roles':
      return renderRoleManagement();
    case 'system-permissions':
      return renderPermissionManagement();
    default:
      return renderWelcome();
  }
}

function initPageLogic(page) {
  switch (page) {
    case 'system-users':
      initUserPage();
      break;
    case 'system-roles':
      initRolePage();
      break;
    case 'system-permissions':
      initPermissionPage();
      break;
  }
}

function renderWelcome() {
  const roleNames = state.user.roles?.map((r) => r.name).join('、') || '无';
  return `
    <div class="welcome-page">
      <div class="welcome-icon">🎉</div>
      <h1 class="welcome-title">欢迎回来，${escapeHtml(state.user.username)}！</h1>
      <p class="welcome-subtitle">您当前的角色：${escapeHtml(roleNames)}</p>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">${state.user.roles?.length || 0}</div>
          <div class="stat-label">角色数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔑</div>
          <div class="stat-value">${state.user.permissionCodes?.length || 0}</div>
          <div class="stat-label">权限数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">${state.menus?.length || 0}</div>
          <div class="stat-label">菜单数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">正常</div>
          <div class="stat-label">账号状态</div>
        </div>
      </div>
    </div>
  `;
}

// ========== User Management ==========
let userPageState = {
  list: [],
  total: 0,
  page: 1,
  pageSize: 10,
  keyword: '',
  showModal: false,
  editingUser: null,
};

function renderUserManagement() {
  return `
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>
    <div class="table-container">
      <div class="toolbar">
        <div class="search-box">
          <input type="text" class="search-input" id="userSearchInput" placeholder="搜索用户名/邮箱" value="${userPageState.keyword}" />
          <button class="btn btn-primary" id="userSearchBtn">搜索</button>
        </div>
        <button class="btn btn-primary" id="userAddBtn">+ 新增用户</button>
      </div>
      <table class="data-table">
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
        <tbody id="userTableBody">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">加载中...</td></tr>
        </tbody>
      </table>
      <div class="pagination" id="userPagination"></div>
    </div>
    <div id="userModal"></div>
  `;
}

function initUserPage() {
  loadUsers();

  document.getElementById('userSearchBtn').addEventListener('click', () => {
    userPageState.keyword = document.getElementById('userSearchInput').value;
    userPageState.page = 1;
    loadUsers();
  });

  document.getElementById('userAddBtn').addEventListener('click', () => {
    userPageState.editingUser = null;
    userPageState.showModal = true;
    renderUserModal();
  });
}

async function loadUsers() {
  try {
    const data = await api(`/users?page=${userPageState.page}&pageSize=${userPageState.pageSize}&keyword=${encodeURIComponent(userPageState.keyword)}`);
    userPageState.list = data.list;
    userPageState.total = data.total;
    renderUserTable();
    renderUserPagination();
  } catch (err) {
    console.error(err);
  }
}

function renderUserTable() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;

  if (userPageState.list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }

  tbody.innerHTML = userPageState.list.map((u) => `
    <tr>
      <td>${u.id}</td>
      <td>${escapeHtml(u.username)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${u.roles?.map((r) => `<span class="tag tag-primary">${escapeHtml(r.name)}</span>`).join('') || '-'}</td>
      <td><span class="tag ${u.status === 'active' ? 'tag-success' : 'tag-danger'}">${u.status === 'active' ? '启用' : '禁用'}</span></td>
      <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
      <td>
        <span class="action-link" data-edit="${u.id}">编辑</span>
        <span class="action-link danger" data-delete="${u.id}">删除</span>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-edit'));
      const user = userPageState.list.find((u) => u.id === id);
      userPageState.editingUser = user;
      userPageState.showModal = true;
      renderUserModal();
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.getAttribute('data-delete'));
      if (confirm('确定要删除该用户吗？')) {
        try {
          await api(`/users/${id}`, { method: 'DELETE' });
          loadUsers();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  });
}

function renderUserPagination() {
  const pag = document.getElementById('userPagination');
  if (!pag) return;

  const totalPages = Math.ceil(userPageState.total / userPageState.pageSize);
  const currentPage = userPageState.page;

  let html = `<span>共 ${userPageState.total} 条</span>`;
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">上一页</button>`;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} data-page="next">下一页</button>`;

  pag.innerHTML = html;

  pag.querySelectorAll('[data-page]').forEach((el) => {
    el.addEventListener('click', () => {
      const page = el.getAttribute('data-page');
      if (page === 'prev' && currentPage > 1) {
        userPageState.page = currentPage - 1;
      } else if (page === 'next' && currentPage < totalPages) {
        userPageState.page = currentPage + 1;
      } else if (page !== 'prev' && page !== 'next') {
        userPageState.page = parseInt(page);
      }
      loadUsers();
    });
  });
}

function renderUserModal() {
  const modalEl = document.getElementById('userModal');
  if (!modalEl) return;

  const user = userPageState.editingUser;
  const isEdit = !!user;

  modalEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${isEdit ? '编辑用户' : '新增用户'}</span>
          <span class="modal-close" id="userModalClose">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label><span class="required">*</span>用户名</label>
            <input type="text" id="formUsername" value="${user?.username || ''}" />
          </div>
          <div class="form-row">
            <label><span class="required">*</span>邮箱</label>
            <input type="email" id="formEmail" value="${user?.email || ''}" />
          </div>
          <div class="form-row">
            <label>${isEdit ? '新密码' : '<span class="required">*</span>密码'}</label>
            <input type="password" id="formPassword" placeholder="${isEdit ? '不修改请留空' : '请输入密码'}" />
          </div>
          <div class="form-row">
            <label>状态</label>
            <select id="formStatus">
              <option value="active" ${user?.status === 'active' ? 'selected' : ''}>启用</option>
              <option value="disabled" ${user?.status === 'disabled' ? 'selected' : ''}>禁用</option>
            </select>
          </div>
          <div class="form-row">
            <label>角色</label>
            <div id="formRoleCheckboxes" class="checkbox-group">加载中...</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" id="userModalCancel">取消</button>
          <button class="btn btn-primary" id="userModalSubmit">确定</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => {
    userPageState.showModal = false;
    modalEl.innerHTML = '';
  };

  document.getElementById('userModalClose').addEventListener('click', closeModal);
  document.getElementById('userModalCancel').addEventListener('click', closeModal);

  loadRolesForUserForm();

  document.getElementById('userModalSubmit').addEventListener('click', async () => {
    const username = document.getElementById('formUsername').value;
    const email = document.getElementById('formEmail').value;
    const password = document.getElementById('formPassword').value;
    const status = document.getElementById('formStatus').value;
    const roleIds = Array.from(document.querySelectorAll('#formRoleCheckboxes input:checked')).map((el) => parseInt(el.value));

    if (!username || !email) {
      alert('请填写用户名和邮箱');
      return;
    }
    if (!isEdit && !password) {
      alert('请输入密码');
      return;
    }

    const body = { username, email, status, roleIds };
    if (password) body.password = password;

    try {
      if (isEdit) {
        await api(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      closeModal();
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadRolesForUserForm() {
  try {
    const roles = await api('/roles');
    const userRoleIds = userPageState.editingUser?.roles?.map((r) => r.id) || [];
    const container = document.getElementById('formRoleCheckboxes');
    if (container) {
      container.innerHTML = roles.map((r) => `
        <label class="checkbox-item">
          <input type="checkbox" value="${r.id}" ${userRoleIds.includes(r.id) ? 'checked' : ''} />
          ${escapeHtml(r.name)}
        </label>
      `).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

// ========== Role Management ==========
let rolePageState = {
  list: [],
  showModal: false,
  editingRole: null,
};

function renderRoleManagement() {
  return `
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
    </div>
    <div class="table-container">
      <div class="toolbar">
        <div></div>
        <button class="btn btn-primary" id="roleAddBtn">+ 新增角色</button>
      </div>
      <table class="data-table">
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
        <tbody id="roleTableBody">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">加载中...</td></tr>
        </tbody>
      </table>
    </div>
    <div id="roleModal"></div>
  `;
}

function initRolePage() {
  loadRoles();

  document.getElementById('roleAddBtn').addEventListener('click', () => {
    rolePageState.editingRole = null;
    rolePageState.showModal = true;
    renderRoleModal();
  });
}

async function loadRoles() {
  try {
    const data = await api('/roles');
    rolePageState.list = data;
    renderRoleTable();
  } catch (err) {
    console.error(err);
  }
}

function renderRoleTable() {
  const tbody = document.getElementById('roleTableBody');
  if (!tbody) return;

  if (rolePageState.list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }

  tbody.innerHTML = rolePageState.list.map((r) => `
    <tr>
      <td>${r.id}</td>
      <td>${escapeHtml(r.name)}</td>
      <td><code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">${escapeHtml(r.code)}</code></td>
      <td>${escapeHtml(r.description || '-')}</td>
      <td>${r.permissions?.length || 0}</td>
      <td>${r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
      <td>
        <span class="action-link" data-edit="${r.id}">编辑</span>
        <span class="action-link danger" data-delete="${r.id}">删除</span>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-edit'));
      const role = rolePageState.list.find((r) => r.id === id);
      rolePageState.editingRole = role;
      rolePageState.showModal = true;
      renderRoleModal();
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.getAttribute('data-delete'));
      if (confirm('确定要删除该角色吗？')) {
        try {
          await api(`/roles/${id}`, { method: 'DELETE' });
          loadRoles();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  });
}

function renderRoleModal() {
  const modalEl = document.getElementById('roleModal');
  if (!modalEl) return;

  const role = rolePageState.editingRole;
  const isEdit = !!role;

  modalEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" style="width:600px;">
        <div class="modal-header">
          <span class="modal-title">${isEdit ? '编辑角色' : '新增角色'}</span>
          <span class="modal-close" id="roleModalClose">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label><span class="required">*</span>角色名称</label>
            <input type="text" id="formRoleName" value="${role?.name || ''}" />
          </div>
          <div class="form-row">
            <label><span class="required">*</span>角色编码</label>
            <input type="text" id="formRoleCode" value="${role?.code || ''}" />
          </div>
          <div class="form-row">
            <label>描述</label>
            <textarea id="formRoleDesc">${role?.description || ''}</textarea>
          </div>
          <div class="form-row">
            <label>权限配置</label>
            <div id="formPermTree" class="perm-tree">加载中...</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" id="roleModalCancel">取消</button>
          <button class="btn btn-primary" id="roleModalSubmit">确定</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => {
    rolePageState.showModal = false;
    modalEl.innerHTML = '';
  };

  document.getElementById('roleModalClose').addEventListener('click', closeModal);
  document.getElementById('roleModalCancel').addEventListener('click', closeModal);

  loadPermissionTreeForRole();

  document.getElementById('roleModalSubmit').addEventListener('click', async () => {
    const name = document.getElementById('formRoleName').value;
    const code = document.getElementById('formRoleCode').value;
    const description = document.getElementById('formRoleDesc').value;
    const permissionIds = Array.from(document.querySelectorAll('#formPermTree input:checked')).map((el) => parseInt(el.value));

    if (!name || !code) {
      alert('请填写角色名称和编码');
      return;
    }

    try {
      if (isEdit) {
        await api(`/roles/${role.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, code, description, permissionIds }),
        });
      } else {
        await api('/roles', {
          method: 'POST',
          body: JSON.stringify({ name, code, description, permissionIds }),
        });
      }
      closeModal();
      loadRoles();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadPermissionTreeForRole() {
  try {
    const tree = await api('/permissions/tree');
    const rolePermIds = rolePageState.editingRole?.permissions?.map((p) => p.id) || [];
    const container = document.getElementById('formPermTree');
    if (container) {
      container.innerHTML = renderPermCheckboxTree(tree, rolePermIds);

      container.querySelectorAll('input[type="checkbox"]').forEach((el) => {
        el.addEventListener('change', (e) => {
          const isChecked = e.target.checked;
          const row = e.target.closest('.perm-tree-node');
          row.querySelectorAll('.perm-tree-children input[type="checkbox"]').forEach((child) => {
            child.checked = isChecked;
          });
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function renderPermCheckboxTree(nodes, checkedIds) {
  if (!nodes || nodes.length === 0) return '';
  return nodes.map((node) => `
    <div class="perm-tree-node">
      <div class="perm-tree-label">
        <input type="checkbox" value="${node.id}" ${checkedIds.includes(node.id) ? 'checked' : ''} />
        <span>${getIcon(node.icon)}</span>
        <span>${escapeHtml(node.name)}</span>
        <span class="tag tag-primary" style="font-size:11px;">${node.type === 'menu' ? '菜单' : '按钮'}</span>
      </div>
      <div class="perm-tree-children">
        ${renderPermCheckboxTree(node.children, checkedIds)}
      </div>
    </div>
  `).join('');
}

// ========== Permission Management ==========
let permPageState = {
  list: [],
  showModal: false,
  editingPerm: null,
};

function renderPermissionManagement() {
  return `
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
    </div>
    <div class="table-container">
      <div class="toolbar">
        <div class="tabs">
          <div class="tab-item active">全部权限</div>
        </div>
        <button class="btn btn-primary" id="permAddBtn">+ 新增权限</button>
      </div>
      <table class="data-table">
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
        <tbody id="permTableBody">
          <tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">加载中...</td></tr>
        </tbody>
      </table>
    </div>
    <div id="permModal"></div>
  `;
}

function initPermissionPage() {
  loadPermissions();

  document.getElementById('permAddBtn').addEventListener('click', () => {
    permPageState.editingPerm = null;
    permPageState.showModal = true;
    renderPermModal();
  });
}

async function loadPermissions() {
  try {
    const data = await api('/permissions');
    permPageState.list = data;
    renderPermTable();
  } catch (err) {
    console.error(err);
  }
}

function renderPermTable() {
  const tbody = document.getElementById('permTableBody');
  if (!tbody) return;

  if (permPageState.list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }

  const buildTree = (items, parentId = null, level = 0) => {
    return items
      .filter((i) => i.parentId === parentId)
      .map((item) => {
        const children = buildTree(items, item.id, level + 1);
        const indent = level > 0 ? '　'.repeat(level - 1) + '├ ' : '';
        return { ...item, indent, level, children };
      });
  };

  const flatten = (nodes) => {
    let result = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children) result = result.concat(flatten(node.children));
    }
    return result;
  };

  const treeData = flatten(buildTree(permPageState.list));

  tbody.innerHTML = treeData.map((p) => `
    <tr>
      <td style="padding-left:${p.level * 20 + 16}px;">
        ${p.level > 0 ? '　'.repeat(p.level - 1) + '└─ ' : ''}
        ${getIcon(p.icon)} ${escapeHtml(p.name)}
      </td>
      <td><code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:12px;">${escapeHtml(p.code)}</code></td>
      <td><span class="tag ${p.type === 'menu' ? 'tag-primary' : 'tag-warning'}">${p.type === 'menu' ? '菜单' : p.type === 'button' ? '按钮' : 'API'}</span></td>
      <td>${escapeHtml(p.path || '-')}</td>
      <td>${getIcon(p.icon)}</td>
      <td>${p.sort}</td>
      <td>
        <span class="action-link" data-edit="${p.id}">编辑</span>
        <span class="action-link danger" data-delete="${p.id}">删除</span>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-edit'));
      const perm = permPageState.list.find((p) => p.id === id);
      permPageState.editingPerm = perm;
      permPageState.showModal = true;
      renderPermModal();
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.getAttribute('data-delete'));
      if (confirm('确定要删除该权限吗？')) {
        try {
          await api(`/permissions/${id}`, { method: 'DELETE' });
          loadPermissions();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  });
}

function renderPermModal() {
  const modalEl = document.getElementById('permModal');
  if (!modalEl) return;

  const perm = permPageState.editingPerm;
  const isEdit = !!perm;

  modalEl.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${isEdit ? '编辑权限' : '新增权限'}</span>
          <span class="modal-close" id="permModalClose">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label><span class="required">*</span>权限名称</label>
            <input type="text" id="formPermName" value="${perm?.name || ''}" />
          </div>
          <div class="form-row">
            <label><span class="required">*</span>权限编码</label>
            <input type="text" id="formPermCode" value="${perm?.code || ''}" />
          </div>
          <div class="form-row">
            <label>类型</label>
            <select id="formPermType">
              <option value="menu" ${perm?.type === 'menu' ? 'selected' : ''}>菜单</option>
              <option value="button" ${perm?.type === 'button' ? 'selected' : ''}>按钮</option>
              <option value="api" ${perm?.type === 'api' ? 'selected' : ''}>API</option>
            </select>
          </div>
          <div class="form-row">
            <label>上级权限</label>
            <select id="formPermParent">
              <option value="">顶级</option>
            </select>
          </div>
          <div class="form-row">
            <label>路由路径</label>
            <input type="text" id="formPermPath" value="${perm?.path || ''}" placeholder="菜单类型可填写" />
          </div>
          <div class="form-row">
            <label>图标</label>
            <input type="text" id="formPermIcon" value="${perm?.icon || ''}" placeholder="setting / user / team 等" />
          </div>
          <div class="form-row">
            <label>排序</label>
            <input type="number" id="formPermSort" value="${perm?.sort ?? 0}" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" id="permModalCancel">取消</button>
          <button class="btn btn-primary" id="permModalSubmit">确定</button>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => {
    permPageState.showModal = false;
    modalEl.innerHTML = '';
  };

  document.getElementById('permModalClose').addEventListener('click', closeModal);
  document.getElementById('permModalCancel').addEventListener('click', closeModal);

  loadParentPermOptions();

  document.getElementById('permModalSubmit').addEventListener('click', async () => {
    const name = document.getElementById('formPermName').value;
    const code = document.getElementById('formPermCode').value;
    const type = document.getElementById('formPermType').value;
    const parentId = document.getElementById('formPermParent').value;
    const path = document.getElementById('formPermPath').value;
    const icon = document.getElementById('formPermIcon').value;
    const sort = parseInt(document.getElementById('formPermSort').value) || 0;

    if (!name || !code) {
      alert('请填写权限名称和编码');
      return;
    }

    const body = {
      name,
      code,
      type,
      parentId: parentId ? parseInt(parentId) : null,
      path,
      icon,
      sort,
    };

    try {
      if (isEdit) {
        await api(`/permissions/${perm.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/permissions', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      closeModal();
      loadPermissions();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadParentPermOptions() {
  try {
    const perms = await api('/permissions?type=menu');
    const select = document.getElementById('formPermParent');
    const currentId = permPageState.editingPerm?.id;

    if (select) {
      const menuPerms = perms.filter((p) => p.id !== currentId);
      select.innerHTML = '<option value="">顶级</option>' + menuPerms.map((p) => `
        <option value="${p.id}" ${permPageState.editingPerm?.parentId === p.id ? 'selected' : ''}>
          ${escapeHtml(p.name)}
        </option>
      `).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingCart,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/admin/dashboard', label: '数据大盘', icon: BarChart3 },
  { path: '/admin/users', label: '用户管理', icon: Users, badge: '12' },
  { path: '/admin/venues', label: '场地审核', icon: Building2, badge: '5' },
  { path: '/admin/orders', label: '订单管理', icon: ShoppingCart },
  { path: '/admin/settings', label: '系统设置', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-primary-700 via-primary-600 to-primary-700 transform transition-transform duration-300 lg:transform-none',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">管理后台</p>
                <p className="text-xs text-white/60">VenueHub Admin</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || '管理员'}
                </p>
                <p className="text-xs text-white/60">超级管理员</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <p className="px-4 pt-2 pb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              功能菜单
            </p>
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all my-0.5 group relative',
                  isActive(item.path)
                    ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white/50 group-hover:text-white/80'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent-coral text-white">
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <ChevronRight className="w-4 h-4 text-white/60" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {MENU_ITEMS.find((m) => isActive(m.path))?.label || '管理后台'}
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  欢迎使用场地预订平台管理系统
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-coral" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Package,
  MessageSquare,
  BarChart3,
  LogOut,
  User,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/host/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/host/venues', label: '场地管理', icon: Building2 },
  { path: '/host/orders', label: '订单管理', icon: ClipboardList },
  { path: '/host/services', label: '配套服务', icon: Package },
  { path: '/host/reviews', label: '评价管理', icon: MessageSquare },
  { path: '/host/analytics', label: '数据分析', icon: BarChart3 },
];

export default function HostLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-neutral-ivory">
      <aside className="w-64 bg-primary-600 flex flex-col fixed h-full shadow-floating z-40">
        <div className="px-6 py-5 border-b border-primary-500/30">
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-gold" />
            </span>
            场地管理中心
          </h1>
          <p className="text-xs text-primary-200 mt-1">Venues Management</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-accent-gold text-primary-900 font-semibold shadow-lg'
                      : 'text-primary-100 hover:bg-primary-500/50 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-primary-500/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-100 hover:bg-primary-500/50 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">退出登录</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">欢迎回来，{user?.name || '用户'}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-coral rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">{user?.name || '用户'}</div>
                  <div className="text-xs text-gray-500">{user?.company || user?.email}</div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-floating border border-gray-100 py-2 animate-fade-in-up">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    返回首页
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-accent-coral hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

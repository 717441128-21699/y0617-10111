import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  Star,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Building2,
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
  icon: typeof CalendarDays;
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/user/bookings', label: '我的订单', icon: CalendarDays },
  { path: '/user/favorites', label: '我的收藏', icon: Heart },
  { path: '/user/reviews', label: '我的评价', icon: Star },
  { path: '/user/settings', label: '账户设置', icon: Settings },
];

export default function UserLayout() {
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
    if (path === '/user/bookings') {
      return location.pathname.startsWith('/user/bookings');
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">客户中心</h1>
              <p className="text-sm text-white/70">管理您的预订订单和个人信息</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">返回首页</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={cn(
              'lg:w-64 flex-shrink-0 transition-all duration-300',
              mobileMenuOpen ? 'block' : 'hidden lg:block'
            )}
          >
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-primary-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user?.name || '客户用户'}
                  </p>
                  <p className="text-xs text-gray-500">普通会员</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-primary-600">12</p>
                  <p className="text-xs text-gray-500">订单</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-amber-500">8</p>
                  <p className="text-xs text-gray-500">收藏</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-emerald-500">5</p>
                  <p className="text-xs text-gray-500">评价</p>
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-2xl shadow-card border border-gray-100 p-2 overflow-hidden">
              <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                菜单
              </p>
              {MENU_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all my-0.5 group',
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      isActive(item.path)
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive(item.path) && (
                    <ChevronRight className="w-4 h-4 text-primary-400" />
                  )}
                </NavLink>
              ))}

              <div className="mt-2 pt-2 border-t border-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors my-0.5"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">退出登录</span>
                </button>
              </div>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

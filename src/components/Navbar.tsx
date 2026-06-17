import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Calendar,
  Heart,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserInfo {
  name: string;
  avatar?: string;
  role: 'host' | 'customer' | 'admin';
}

interface NavbarProps {
  user?: UserInfo | null;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogin, onRegister, onLogout }: NavbarProps) {
  const location = useLocation();
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '场地列表', path: '/venues' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const customerMenuItems = [
    { name: '我的订单', icon: Calendar, path: '/customer/bookings' },
    { name: '我的收藏', icon: Heart, path: '/customer/favorites' },
    { name: '账户设置', icon: Settings, path: '/customer/settings' },
  ];

  const hostMenuItems = [
    { name: '管理后台', icon: LayoutDashboard, path: '/host/dashboard' },
    { name: '场地管理', icon: Building2, path: '/host/venues' },
    { name: '订单管理', icon: Calendar, path: '/host/bookings' },
    { name: '账户设置', icon: Settings, path: '/host/settings' },
  ];

  const centerMenuItems = user?.role === 'host' ? hostMenuItems : customerMenuItems;
  const centerLabel = user?.role === 'host' ? '场地方中心' : '客户中心';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold text-primary-700">悦场</span>
              <span className="text-xs text-primary-500 font-medium tracking-wide">VenueHub</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                )}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setCenterDropdownOpen(!centerDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    centerDropdownOpen
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  )}
                >
                  {centerLabel}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      centerDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {centerDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-gray-100 py-2 animate-fade-in">
                    {centerMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setCenterDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogin}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-all"
                >
                  登录
                </button>
                <button
                  onClick={onRegister}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
                >
                  注册
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setCenterDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-primary-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform duration-200',
                      userDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user.role === 'host' ? '场地方' : user.role === 'admin' ? '管理员' : '客户'}
                      </p>
                    </div>
                    <Link
                      to={user.role === 'host' ? '/host/settings' : '/customer/settings'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      账户设置
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive(link.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {user && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {centerLabel}
                  </p>
                  {centerMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {!user ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogin?.();
                  }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  登录
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRegister?.();
                  }}
                  className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all"
                >
                  注册
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 space-y-1">
                <div className="flex items-center gap-3 px-4 py-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'host' ? '场地方' : user.role === 'admin' ? '管理员' : '客户'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

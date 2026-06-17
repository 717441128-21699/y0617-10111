import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import HostLayout from '@/layouts/HostLayout';
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VenueList from '@/pages/VenueList';
import VenueDetail from '@/pages/VenueDetail';
import HostDashboard from '@/pages/host/HostDashboard';
import HostVenues from '@/pages/host/HostVenues';
import HostOrders from '@/pages/host/HostOrders';
import HostAnalytics from '@/pages/host/HostAnalytics';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserBookings from '@/pages/user/UserBookings';

function HostVenueForm() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">场地表单</h2>
        <p className="text-gray-500">场地创建/编辑表单: 正在建设中</p>
      </div>
    </div>
  );
}

function HostPricing() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">价格管理</h2>
        <p className="text-gray-500">场地价格配置: 正在建设中</p>
      </div>
    </div>
  );
}

function HostServices() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">增值服务</h2>
        <p className="text-gray-500">增值服务管理: 正在建设中</p>
      </div>
    </div>
  );
}

function HostReviews() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">评价管理</h2>
        <p className="text-gray-500">场地方评价管理: 正在建设中</p>
      </div>
    </div>
  );
}

function UserFavorites() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">我的收藏</h2>
        <p className="text-gray-500">我的收藏: 正在建设中</p>
      </div>
    </div>
  );
}

function UserReviews() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">我的评价</h2>
        <p className="text-gray-500">我的评价: 正在建设中</p>
      </div>
    </div>
  );
}

function UserSettings() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">账户设置</h2>
        <p className="text-gray-500">账户设置: 正在建设中</p>
      </div>
    </div>
  );
}

function AdminUsers() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">用户管理</h2>
        <p className="text-gray-500">用户管理: 正在建设中</p>
      </div>
    </div>
  );
}

function AdminVenues() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">场地审核</h2>
        <p className="text-gray-500">场地审核: 正在建设中</p>
      </div>
    </div>
  );
}

function AdminOrders() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">订单管理</h2>
        <p className="text-gray-500">订单管理: 正在建设中</p>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">系统设置</h2>
        <p className="text-gray-500">系统设置: 正在建设中</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<VenueList />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
        </Route>

        <Route element={<HostLayout />}>
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/venues" element={<HostVenues />} />
          <Route path="/host/venues/new" element={<HostVenueForm />} />
          <Route path="/host/venues/:id/edit" element={<HostVenueForm />} />
          <Route path="/host/venues/:id/pricing" element={<HostPricing />} />
          <Route path="/host/orders" element={<HostOrders />} />
          <Route path="/host/services" element={<HostServices />} />
          <Route path="/host/reviews" element={<HostReviews />} />
          <Route path="/host/analytics" element={<HostAnalytics />} />
        </Route>

        <Route element={<UserLayout />}>
          <Route path="/user/bookings" element={<UserBookings />} />
          <Route path="/user/favorites" element={<UserFavorites />} />
          <Route path="/user/reviews" element={<UserReviews />} />
          <Route path="/user/settings" element={<UserSettings />} />
        </Route>

        <Route path="/customer/bookings" element={<Navigate to="/user/bookings" replace />} />
        <Route path="/customer/favorites" element={<Navigate to="/user/favorites" replace />} />
        <Route path="/customer/settings" element={<Navigate to="/user/settings" replace />} />

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/venues" element={<AdminVenues />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="/host/bookings" element={<Navigate to="/host/orders" replace />} />
        <Route path="/host/settings" element={<Navigate to="/host/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  DollarSign,
  Banknote,
  Search,
  Filter,
  Hash,
  MessageCircle,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import {
  BOOKING_STATUS_LABELS,
  TIME_SLOT_LABELS,
  SERVICE_CATEGORY_LABELS,
  type Booking,
  type BookingStatus,
  type ServiceDetail,
} from '../../../shared/types';
import { cn } from '@/lib/utils';
import Modal from '@/components/Modal';
import { reviewsApi } from '@/lib/api';

type TabKey = 'all' | BookingStatus;

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'depositPaid', label: '定金已付' },
  { key: 'confirmed', label: '已确认' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const statusBadgeColors: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  depositPaid: 'bg-purple-50 text-purple-700 border-purple-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function HostOrders() {
  const { bookings, loading, fetchBookings, updateBookingStatus } = useBookingStore();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewContent, setReviewContent] = useState<{ rating: number; content: string } | null>(null);
  const [detailModalBooking, setDetailModalBooking] = useState<Booking | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      all: bookings.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      depositPaid: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      counts[b.status]++;
    });
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (activeTab !== 'all') {
      result = result.filter((b) => b.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.user?.name?.toLowerCase().includes(q) ||
          b.user?.phone?.includes(q) ||
          b.venue?.name?.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [bookings, activeTab, searchQuery]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleApprove = async (booking: Booking) => {
    setSubmitting(true);
    try {
      const success = await updateBookingStatus(booking.id, 'approved');
      if (success) {
        showToast('订单已通过审核', 'success');
        fetchBookings();
      } else {
        showToast('操作失败，请重试', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalBooking || !rejectReason.trim()) {
      showToast('请填写拒绝原因', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const success = await updateBookingStatus(
        rejectModalBooking.id,
        'rejected',
        rejectReason.trim()
      );
      if (success) {
        showToast('已拒绝订单', 'success');
        setRejectModalBooking(null);
        setRejectReason('');
        fetchBookings();
      } else {
        showToast('操作失败，请重试', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (booking: Booking) => {
    setSubmitting(true);
    try {
      const success = await updateBookingStatus(booking.id, 'confirmed');
      if (success) {
        showToast('订单已确认', 'success');
        fetchBookings();
      } else {
        showToast('操作失败，请重试', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReview = async (booking: Booking) => {
    try {
      const res = await reviewsApi.getReviewsByVenue(booking.venueId);
      if (res.success && res.data) {
        const review = res.data.find((r) => r.bookingId === booking.id);
        if (review) {
          setReviewContent({ rating: review.rating, content: review.content });
        } else {
          setReviewContent({ rating: 0, content: '暂无评价内容' });
        }
        setReviewModalBooking(booking);
      }
    } catch {
      showToast('获取评价失败', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-display">订单管理</h1>
          <p className="text-gray-500 mt-1">管理您的场地预订订单，处理审核与确认</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号/客户/场地..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
        <div className="border-b border-gray-100 px-2 pt-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center',
                        isActive ? 'bg-accent-gold text-primary-900' : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-gray-400 text-sm pr-2">
              <Filter className="w-4 h-4" />
              <span>共 {filteredBookings.length} 条</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Hash className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">暂无订单</h3>
              <p className="text-gray-400 mt-2 text-sm">
                {searchQuery ? '没有找到匹配的订单，请尝试其他关键词' : '当前状态下暂无订单记录'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-48 h-40 lg:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
                      {booking.venue?.images?.[0] ? (
                        <img
                          src={booking.venue.images[0]}
                          alt={booking.venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MapPin className="w-10 h-10" />
                        </div>
                      )}
                      {booking.venue && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-sm font-medium truncate">
                            {booking.venue.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono font-semibold text-primary-900">
                              #{booking.id.slice(0, 10).toUpperCase()}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium border',
                              statusBadgeColors[booking.status]
                            )}
                          >
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-xs text-gray-400">总价</span>
                            <span className="text-xl font-bold text-primary-900 font-display">
                              ¥{booking.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-gray-500">
                            <Banknote className="w-3 h-3" />
                            定金 ¥{booking.deposit.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="text-gray-600">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="text-gray-600 truncate">
                            {TIME_SLOT_LABELS[booking.timeSlot]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="text-gray-600">
                            {booking.eventType} · {booking.estimatedPeople}人
                          </span>
                        </div>
                      </div>

                      {booking.status === 'depositPaid' && (
                        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-2.5">
                          <span className="text-2xl">💰</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-emerald-800">定金已到账</p>
                            <p className="text-xs text-emerald-600/80 mt-0.5">
                              客户已支付定金 ¥{booking.deposit.toLocaleString()}，请及时确认订单
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-700">¥{booking.deposit.toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-600/70">已收款</p>
                          </div>
                        </div>
                      )}

                      {booking.user && (
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-cream/60 border border-neutral-cream">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {booking.user.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary-900 truncate">
                              {booking.user.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {booking.user.phone || booking.user.email}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setDetailModalBooking(booking)}
                              className="px-4 py-2 rounded-xl text-sm font-medium border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" />
                              查看详情
                            </button>
                            <button
                              onClick={() => handleApprove(booking)}
                              disabled={submitting}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              审核通过
                            </button>
                            <button
                              onClick={() => setRejectModalBooking(booking)}
                              disabled={submitting}
                              className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              审核拒绝
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => setDetailModalBooking(booking)}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-primary-500/20"
                          >
                            <Eye className="w-4 h-4" />
                            查看详情
                          </button>
                        )}
                        {booking.status === 'depositPaid' && (
                          <button
                            onClick={() => handleConfirm(booking)}
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm shadow-primary-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            确认订单
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button
                            onClick={() => handleViewReview(booking)}
                            className="px-4 py-2 rounded-xl text-sm font-medium border border-accent-gold/40 text-accent-goldDark hover:bg-accent-gold/10 transition-colors flex items-center gap-1.5"
                          >
                            <Star className="w-4 h-4" />
                            查看评价
                          </button>
                        )}
                        {(booking.status === 'confirmed' ||
                          booking.status === 'cancelled' ||
                          booking.status === 'rejected') && (
                          <button
                            onClick={() => setDetailModalBooking(booking)}
                            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            查看详情
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!rejectModalBooking}
        onClose={() => {
          setRejectModalBooking(null);
          setRejectReason('');
        }}
        title="拒绝订单"
        description={`请说明拒绝订单 #${rejectModalBooking?.id.slice(0, 8).toUpperCase()} 的原因`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setRejectModalBooking(null);
                setRejectReason('');
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || submitting}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm shadow-red-500/20"
            >
              {submitting ? '提交中...' : '确认拒绝'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              拒绝原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="请填写拒绝原因，这将告知客户订单被拒绝的具体原因..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none text-sm"
            />
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-red-50 p-3 rounded-xl">
            <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <span>拒绝原因将发送给客户，请填写清晰、礼貌的理由以维护良好的商家形象。</span>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!detailModalBooking}
        onClose={() => setDetailModalBooking(null)}
        title="订单详情"
        size="lg"
      >
        {detailModalBooking && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">订单号</p>
                <p className="text-lg font-mono font-bold text-primary-900">
                  #{detailModalBooking.id.slice(0, 12).toUpperCase()}
                </p>
              </div>
              <span
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-medium border',
                  statusBadgeColors[detailModalBooking.status]
                )}
              >
                {BOOKING_STATUS_LABELS[detailModalBooking.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">预订日期</p>
                <p className="font-medium text-gray-900">{detailModalBooking.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">预订时段</p>
                <p className="font-medium text-gray-900">
                  {TIME_SLOT_LABELS[detailModalBooking.timeSlot]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">活动类型</p>
                <p className="font-medium text-gray-900">{detailModalBooking.eventType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">预估人数</p>
                <p className="font-medium text-gray-900">{detailModalBooking.estimatedPeople} 人</p>
              </div>
            </div>

            {detailModalBooking.venue && (
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">场地信息</p>
                <p className="font-medium text-primary-900">{detailModalBooking.venue.name}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {detailModalBooking.venue.city} · {detailModalBooking.venue.address}
                </p>
              </div>
            )}

            {detailModalBooking.user && (
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">客户信息</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                    {detailModalBooking.user.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{detailModalBooking.user.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {detailModalBooking.user.phone || detailModalBooking.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {detailModalBooking.specialRequirements && (
              <div>
                <p className="text-xs text-gray-500 mb-2">特殊需求</p>
                <p className="text-gray-700 p-3 rounded-xl bg-gray-50 text-sm">
                  {detailModalBooking.specialRequirements}
                </p>
              </div>
            )}

            {detailModalBooking.hostReply && (
              <div>
                <p className="text-xs text-gray-500 mb-2">场地方回复</p>
                <p className="text-gray-700 p-3 rounded-xl bg-blue-50 text-sm border border-blue-100">
                  {detailModalBooking.hostReply}
                </p>
              </div>
            )}

            {(() => {
              const servicesDetail: ServiceDetail[] = detailModalBooking.servicesDetail || [];
              const servicesTotal = servicesDetail.reduce((sum, s) => sum + s.subtotal, 0);
              const venueFee = detailModalBooking.totalAmount - servicesTotal;
              const isAmountInconsistent = venueFee < 0;
              const displayVenueFee = Math.max(0, venueFee);
              return (
                <>
                  {servicesDetail.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-primary-500" />
                        <p className="text-sm font-semibold text-gray-900">配套服务明细</p>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-500">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">服务名称</th>
                              <th className="px-4 py-3 text-left font-medium">类别</th>
                              <th className="px-4 py-3 text-right font-medium">单价</th>
                              <th className="px-4 py-3 text-right font-medium">数量</th>
                              <th className="px-4 py-3 text-right font-medium">小计</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {servicesDetail.map((s, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {SERVICE_CATEGORY_LABELS[s.category]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  ¥{s.price.toLocaleString()}
                                  <span className="text-gray-400 text-xs">/{s.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">{s.quantity}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                  ¥{s.subtotal.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    {isAmountInconsistent && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <p className="font-semibold mb-0.5">金额数据异常</p>
                          <p className="text-amber-700/80">
                            服务明细合计 ¥{servicesTotal.toLocaleString()} 超过订单总价 ¥{detailModalBooking.totalAmount.toLocaleString()}，
                            可能是历史数据价格变更导致。以下场地费为系统估算值，实际以订单总价为准。
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-gray-600">场地费{isAmountInconsistent ? '（估算）' : ''}</span>
                      <span className={cn('font-medium', isAmountInconsistent ? 'text-amber-700' : 'text-gray-900')}>
                        ¥{displayVenueFee.toLocaleString()}
                      </span>
                    </div>
                    {servicesDetail.length > 0 && (
                      <div className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-gray-600">
                          服务费合计 ({servicesDetail.length}项)
                        </span>
                        <span className="font-medium text-gray-900">
                          ¥{servicesTotal.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1.5 text-sm border-t border-dashed border-gray-200 pt-3">
                      <span className="font-semibold text-gray-800">订单总额</span>
                      <span className="font-bold text-gray-900 text-lg">
                        ¥{detailModalBooking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 rounded-xl bg-amber-50/80 border border-amber-100 px-4 mt-3">
                      <span className="text-sm text-amber-700 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        预订定金（30%）
                      </span>
                      <span className="font-bold text-amber-800 text-lg">
                        ¥{detailModalBooking.deposit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {detailModalBooking.status === 'pending' && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => {
                          setRejectModalBooking(detailModalBooking);
                          setDetailModalBooking(null);
                        }}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        审核拒绝
                      </button>
                      <button
                        onClick={async () => {
                          await handleApprove(detailModalBooking);
                          setDetailModalBooking(null);
                        }}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        审核通过
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!reviewModalBooking}
        onClose={() => {
          setReviewModalBooking(null);
          setReviewContent(null);
        }}
        title="客户评价"
        size="md"
      >
        {reviewModalBooking && reviewContent && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent-gold/10 border border-accent-gold/20">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < reviewContent.rating
                        ? 'fill-accent-gold text-accent-gold'
                        : 'text-gray-300'
                    )}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-accent-goldDark">
                  {reviewContent.rating > 0 ? `${reviewContent.rating}.0` : '暂无'}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{reviewContent.content}</p>
            </div>
            {reviewModalBooking.venue && (
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {reviewModalBooking.venue.name}
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div
          className={cn(
            'fixed bottom-8 right-8 z-[200] px-5 py-3 rounded-xl shadow-floating animate-fade-in-up flex items-center gap-2 text-sm font-medium',
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  Star,
  Loader2,
  Search,
  ChevronRight,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  XCircle,
  Package,
  MessageSquare,
} from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import type { Booking, BookingStatus } from '../../../shared/types';
import { BOOKING_STATUS_LABELS, TIME_SLOT_LABELS } from '../../../shared/types';
import { cn } from '@/lib/utils';

type TabStatus = 'all' | BookingStatus;

interface BookingTab {
  value: TabStatus;
  label: string;
}

const TABS: BookingTab[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '待支付定金' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
];

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Hourglass },
  approved: { bg: 'bg-blue-50', text: 'text-blue-600', icon: CreditCard },
  depositPaid: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: CheckCircle2 },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
  completed: { bg: 'bg-gray-50', text: 'text-gray-600', icon: Package },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', icon: AlertCircle },
};

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function img(prompt: string): string {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;
}

function generateMockBookings(): Booking[] {
  return [
    {
      id: 'booking1',
      venueId: 'venue1',
      userId: 'cust1',
      date: '2026-07-20',
      timeSlot: 'fullDay',
      eventType: '婚礼婚宴',
      estimatedPeople: 300,
      totalAmount: 128000,
      deposit: 38400,
      status: 'completed',
      selectedServices: [],
      createdAt: '2026-04-01T10:00:00Z',
      venue: {
        id: 'venue1',
        name: '华盛水晶宴会厅',
        type: 'banquet',
        city: '上海',
        address: '浦东新区陆家嘴环路1000号',
        area: 1200,
        capacity: 500,
        description: '',
        facilities: [],
        images: [img('luxury banquet hall with crystal chandeliers elegant interior')],
        styleImages: [],
        basePrice: 28000,
        rating: 4.8,
        reviewCount: 56,
        status: 'published',
        hostId: 'host1',
        createdAt: '',
      },
    },
    {
      id: 'booking2',
      venueId: 'venue2',
      userId: 'cust2',
      date: '2026-07-15',
      timeSlot: 'evening',
      eventType: '企业年会',
      estimatedPeople: 200,
      totalAmount: 85000,
      deposit: 25500,
      status: 'confirmed',
      selectedServices: [],
      createdAt: '2026-04-15T14:30:00Z',
      venue: {
        id: 'venue2',
        name: '璀璨花园宴会厅',
        type: 'banquet',
        city: '北京',
        address: '朝阳区建国路88号',
        area: 800,
        capacity: 350,
        description: '',
        facilities: [],
        images: [img('elegant garden banquet hall european style interior')],
        styleImages: [],
        basePrice: 22000,
        rating: 4.6,
        reviewCount: 38,
        status: 'published',
        hostId: 'host1',
        createdAt: '',
      },
    },
    {
      id: 'booking3',
      venueId: 'venue3',
      userId: 'cust1',
      date: '2026-07-25',
      timeSlot: 'fullDay',
      eventType: '产品发布会',
      estimatedPeople: 500,
      totalAmount: 180000,
      deposit: 54000,
      status: 'depositPaid',
      selectedServices: [],
      createdAt: '2026-05-01T09:00:00Z',
      venue: {
        id: 'venue3',
        name: '国际会展中心A馆',
        type: 'exhibition',
        city: '上海',
        address: '徐汇区漕宝路88号',
        area: 3000,
        capacity: 2000,
        description: '',
        facilities: [],
        images: [img('large exhibition hall interior with modern design')],
        styleImages: [],
        basePrice: 50000,
        rating: 4.5,
        reviewCount: 24,
        status: 'published',
        hostId: 'host2',
        createdAt: '',
      },
    },
    {
      id: 'booking4',
      venueId: 'venue4',
      userId: 'cust2',
      date: '2026-06-28',
      timeSlot: 'afternoon',
      eventType: '婚礼婚宴',
      estimatedPeople: 150,
      totalAmount: 45000,
      deposit: 13500,
      status: 'approved',
      selectedServices: [],
      createdAt: '2026-05-10T11:20:00Z',
      venue: {
        id: 'venue4',
        name: '湖畔户外草坪',
        type: 'outdoor',
        city: '杭州',
        address: '西湖区龙井路1号',
        area: 2000,
        capacity: 300,
        description: '',
        facilities: [],
        images: [img('outdoor lawn venue by lake with beautiful scenery')],
        styleImages: [],
        basePrice: 15000,
        rating: 4.7,
        reviewCount: 42,
        status: 'published',
        hostId: 'host2',
        createdAt: '',
      },
    },
    {
      id: 'booking5',
      venueId: 'venue5',
      userId: 'cust1',
      date: '2026-06-22',
      timeSlot: 'morning',
      eventType: '学术会议',
      estimatedPeople: 300,
      totalAmount: 68000,
      deposit: 20400,
      status: 'pending',
      selectedServices: [],
      createdAt: '2026-06-15T16:00:00Z',
      venue: {
        id: 'venue5',
        name: '云顶国际会议中心',
        type: 'conference',
        city: '深圳',
        address: '福田区深南大道6008号',
        area: 1500,
        capacity: 800,
        description: '',
        facilities: [],
        images: [img('modern conference center interior with auditorium')],
        styleImages: [],
        basePrice: 35000,
        rating: 4.4,
        reviewCount: 31,
        status: 'published',
        hostId: 'host1',
        createdAt: '',
      },
    },
    {
      id: 'booking6',
      venueId: 'venue6',
      userId: 'cust1',
      date: '2026-06-30',
      timeSlot: 'evening',
      eventType: '生日派对',
      estimatedPeople: 80,
      totalAmount: 28000,
      deposit: 8400,
      status: 'depositPaid',
      selectedServices: [],
      createdAt: '2026-05-20T13:00:00Z',
      venue: {
        id: 'venue6',
        name: '艺术空间创意馆',
        type: 'other',
        city: '北京',
        address: '海淀区中关村大街1号',
        area: 600,
        capacity: 200,
        description: '',
        facilities: [],
        images: [img('industrial style art space creative venue interior')],
        styleImages: [],
        basePrice: 12000,
        rating: 4.3,
        reviewCount: 18,
        status: 'published',
        hostId: 'host2',
        createdAt: '',
      },
    },
  ];
}

export default function UserBookings() {
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingsApi.getBookings();
        if (res.success && res.data && res.data.length > 0) {
          setBookings(res.data);
        } else {
          setBookings(generateMockBookings());
        }
      } catch {
        setBookings(generateMockBookings());
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesTab = activeTab === 'all' || booking.status === activeTab;
    const matchesSearch = !searchKeyword ||
      booking.venue?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    if (tab.value === 'all') {
      acc[tab.value] = bookings.length;
    } else {
      acc[tab.value] = bookings.filter((b) => b.status === tab.value).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const handlePayDeposit = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const res = await bookingsApi.payDeposit(bookingId);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'depositPaid' as BookingStatus } : b
          )
        );
      }
    } catch {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'depositPaid' as BookingStatus } : b
        )
      );
    } finally {
      setPayingId(null);
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    if (status === 'approved') return '待支付定金';
    if (status === 'depositPaid') return '已确认';
    return BOOKING_STATUS_LABELS[status];
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">我的订单</h1>
          <p className="mt-1 text-gray-500">查看和管理您的所有预订订单</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-1.5 mb-6">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold',
                    activeTab === tab.value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {tabCounts[tab.value] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索场地名称或活动类型..."
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <CalendarClock className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无订单</h3>
            <p className="text-gray-500 mb-6">还没有找到符合条件的预订订单</p>
            <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
              去浏览场地
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = STATUS_CONFIG[booking.status];
              const StatusIcon = statusConfig.icon;
              const venueImage = booking.venue?.images?.[0] || img('modern event venue interior');
              const venueName = booking.venue?.name || '未知场地';
              const venueCity = booking.venue?.city || '';
              const venueAddress = booking.venue?.address || '';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative">
                      <img
                        src={venueImage}
                        alt={venueName}
                        className="w-full h-full object-cover"
                      />
                      {booking.venue?.rating && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-white">{booking.venue.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{venueName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{venueCity} · {venueAddress}</span>
                          </div>
                        </div>
                        <div className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium w-fit',
                          statusConfig.bg,
                          statusConfig.text
                        )}>
                          <StatusIcon className="w-4 h-4" />
                          {getStatusLabel(booking.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <InfoItem icon={Calendar} label="使用日期" value={formatDisplayDate(booking.date)} />
                        <InfoItem icon={Clock} label="时段" value={TIME_SLOT_LABELS[booking.timeSlot]} />
                        <InfoItem icon={MessageSquare} label="活动类型" value={booking.eventType} />
                        <InfoItem icon={Users} label="预计人数" value={`${booking.estimatedPeople} 人`} />
                      </div>

                      {booking.hostReply && (
                        <div className="mb-5 p-3 rounded-xl bg-primary-50/50 border border-primary-100">
                          <p className="text-xs text-primary-600 font-medium mb-1">场地方回复</p>
                          <p className="text-sm text-gray-700">{booking.hostReply}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-baseline gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">定金</p>
                            <p className="text-lg font-bold text-primary-600">
                              ¥{booking.deposit.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-gray-300">/</div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">总价</p>
                            <p className="text-lg font-bold text-gray-900">
                              ¥{booking.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === 'approved' && (
                            <button
                              onClick={() => handlePayDeposit(booking.id)}
                              disabled={payingId === booking.id}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-xl transition-all active:scale-95"
                            >
                              {payingId === booking.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  支付中...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4" />
                                  支付定金
                                </>
                              )}
                            </button>
                          )}
                          {booking.status === 'completed' && (
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all active:scale-95">
                              <Star className="w-4 h-4" />
                              发表评价
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors">
                            订单详情
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: typeof Calendar;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

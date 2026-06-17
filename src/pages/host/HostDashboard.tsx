import { useEffect, useState } from 'react';
import {
  Building2,
  ClipboardList,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  Users,
  Eye,
  PieChart as PieChartIcon,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { analyticsApi, bookingsApi } from '@/lib/api';
import { useBookingStore } from '@/store/bookingStore';
import {
  BOOKING_STATUS_LABELS,
  TIME_SLOT_LABELS,
  type Booking,
  type MonthlyRevenueData,
  type RevenueSummary,
} from '../../../shared/types';
import { cn } from '@/lib/utils';

interface HostOverviewData {
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  depositPaid: 'bg-purple-100 text-purple-700 border-purple-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const VENUE_COLOR = '#1E3A5F';
const SERVICE_COLOR = '#D4AF37';

const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  trend,
  color,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  trend?: { value: string; positive: boolean };
  color: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      'bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-50',
      highlight && 'ring-2 ring-primary-100 bg-gradient-to-br from-primary-50/30 to-white'
    )}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className="mt-3 flex items-baseline gap-1">
          {prefix && <span className="text-2xl text-gray-600 font-medium">{prefix}</span>}
          <span
            className={cn(
              'text-3xl font-bold font-display',
              highlight ? 'text-primary-700' : 'text-primary-900'
            )}
          >
            {value}
          </span>
          {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
        </div>
        {trend && (
          <div
            className={cn(
              'mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
              trend.positive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            <TrendingUp className={cn('w-3 h-3', !trend.positive && 'rotate-180')} />
            {trend.value}
          </div>
        )}
      </div>
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center',
          color
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
    </div>
  </div>
);

export default function HostDashboard() {
  const [overview, setOverview] = useState<HostOverviewData>({
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [overviewRes, revenueRes, summaryRes, bookingsRes] = await Promise.all([
          analyticsApi.getHostOverview(),
          analyticsApi.getMonthlyRevenue({ year: new Date().getFullYear() }),
          analyticsApi.getRevenueSummary({ months: 6 }),
          bookingsApi.getBookings(),
        ]);

        if (overviewRes.success && overviewRes.data) {
          setOverview(overviewRes.data);
        }
        if (revenueRes.success && revenueRes.data) {
          setMonthlyRevenue(revenueRes.data);
        }
        if (summaryRes.success && summaryRes.data) {
          setRevenueSummary(summaryRes.data);
        }
        if (bookingsRes.success && bookingsRes.data) {
          const allBookings = bookingsRes.data;
          setPendingCount(allBookings.filter((b) => b.status === 'pending').length);
          setRecentBookings(allBookings.slice(0, 5));
        } else {
          await fetchBookings();
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-display">数据看板</h1>
          <p className="text-gray-500 mt-1">查看您的业务运营状况与核心指标</p>
        </div>
        <div className="text-sm text-gray-500">
          <Calendar className="w-4 h-4 inline mr-1" />
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="总场地数"
          value={overview.totalVenues}
          suffix="个"
          trend={{ value: '+1 本月', positive: true }}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={ClipboardList}
          label="总订单数"
          value={overview.totalBookings}
          suffix="单"
          trend={{ value: '+12% 同比', positive: true }}
          color="bg-accent-gold/20 text-accent-goldDark"
        />
        <StatCard
          icon={DollarSign}
          label="总收入"
          value={overview.totalRevenue.toLocaleString()}
          prefix="¥"
          trend={{ value: '+8.5% 同比', positive: true }}
          color="bg-emerald-50 text-emerald-600"
          highlight
        />
        <StatCard
          icon={Clock}
          label="待处理订单"
          value={pendingCount}
          suffix="单"
          color={pendingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          label="场地收入"
          value={revenueSummary?.totalVenueRevenue?.toLocaleString() || '0'}
          prefix="¥"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Sparkles}
          label="服务收入"
          value={revenueSummary?.totalServiceRevenue?.toLocaleString() || '0'}
          prefix="¥"
          color="bg-amber-50 text-amber-600"
        />
        <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">收入占比</p>
              <p className="mt-1 text-xs text-gray-400">
                场地 vs 服务
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-accent-gold/20 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VENUE_COLOR }} />
                  <span className="text-xs text-gray-600 font-medium">场地收入</span>
                </div>
                <span className="text-xs font-bold text-primary-900">
                  {revenueSummary?.venuePercentage?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${revenueSummary?.venuePercentage || 0}%`,
                    backgroundColor: VENUE_COLOR,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERVICE_COLOR }} />
                  <span className="text-xs text-gray-600 font-medium">服务收入</span>
                </div>
                <span className="text-xs font-bold text-primary-900">
                  {revenueSummary?.servicePercentage?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${revenueSummary?.servicePercentage || 0}%`,
                    backgroundColor: SERVICE_COLOR,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display">月度收入趋势</h3>
              <p className="text-sm text-gray-500 mt-1">全年订单收入变化情况（拆分场地/服务）</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: VENUE_COLOR }} />
                场地收入
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SERVICE_COLOR }} />
                服务收入
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                订单数
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="dashColorVenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VENUE_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={VENUE_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashColorService" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERVICE_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={SERVICE_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B6B6B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.12)',
                  }}
                  formatter={(value: number, name: string) => {
                    const labelMap: Record<string, string> = {
                      revenue: '总收入',
                      venueRevenue: '场地收入',
                      serviceRevenue: '服务收入',
                      bookings: '订单数',
                    };
                    return [
                      name === 'bookings' ? `${value} 单` : `¥${value.toLocaleString()}`,
                      labelMap[name] || name,
                    ];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="venueRevenue"
                  name="场地收入"
                  stackId="1"
                  stroke={VENUE_COLOR}
                  strokeWidth={3}
                  fill="url(#dashColorVenue)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="serviceRevenue"
                  name="服务收入"
                  stackId="1"
                  stroke={SERVICE_COLOR}
                  strokeWidth={3}
                  fill="url(#dashColorService)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  name="订单数"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: '#FF6B35', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary-900 font-display">近期订单</h3>
              <p className="text-sm text-gray-500 mt-1">最近 5 笔预订记录</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无订单记录</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-primary-900 text-sm">
                        #{booking.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {booking.date} · {TIME_SLOT_LABELS[booking.timeSlot]}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border',
                        statusColors[booking.status]
                      )}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      {booking.estimatedPeople}人
                    </div>
                    <div className="text-sm font-semibold text-primary-700">
                      ¥{booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentBookings.length > 0 && (
            <button
              onClick={() => (window.location.href = '/host/orders')}
              className="w-full mt-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              查看全部订单
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
